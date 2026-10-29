import type { GeoPoint, Incident, IncidentPriority } from '../types/incident';
import type { ScoreBreakdown, ScoringRuleResult } from '../types/intelligence';
import {
  GEOGRAPHIC_OVERLAP_THRESHOLD,
  PRIORITY_THRESHOLDS,
  RULE_WEIGHTS,
  SCORE_BOUNDS,
  TEMPORAL_RELEVANCE_WINDOW_MINUTES,
} from './scoringConfig';

/**
 * Great-circle distance between two points, in kilometers.
 */
export function haversineDistanceKm(a: GeoPoint, b: GeoPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.min(1, Math.sqrt(h)));
}

export interface GeographicOverlapResult {
  overlap: number; // 0–1
  method: 'region_match' | 'coordinate_proximity' | 'insufficient_data';
}

/**
 * Estimate how much two incidents' geography overlaps. Prefers an exact
 * region-name match (common for this prototype's data), and falls back to
 * coordinate proximity when both incidents carry coordinates. If neither is
 * available, overlap is reported as 0 with method `insufficient_data` —
 * the engine must never assume overlap it cannot support.
 */
export function geographicOverlap(a: Incident, b: Incident): GeographicOverlapResult {
  if (a.region && b.region && a.region.trim().toLowerCase() === b.region.trim().toLowerCase()) {
    return { overlap: 1, method: 'region_match' };
  }

  if (a.coordinates && b.coordinates) {
    const distanceKm = haversineDistanceKm(a.coordinates, b.coordinates);
    // Treat incidents within ~150km as meaningfully overlapping, decaying to
    // 0 by ~600km. This is a deliberately simple proxy for a real geospatial
    // boundary intersection, which the backend can later replace.
    const overlap = Math.max(0, 1 - distanceKm / 600);
    return { overlap: Math.min(1, overlap), method: 'coordinate_proximity' };
  }

  return { overlap: 0, method: 'insufficient_data' };
}

export interface TemporalOverlapResult {
  withinWindow: boolean;
  gapMinutes: number;
}

export function temporalOverlap(a: Incident, b: Incident): TemporalOverlapResult {
  const gapMs = Math.abs(new Date(a.reportedAt).getTime() - new Date(b.reportedAt).getTime());
  const gapMinutes = Math.round(gapMs / 60000);
  return { withinWindow: gapMinutes <= TEMPORAL_RELEVANCE_WINDOW_MINUTES, gapMinutes };
}

function isCriticalServiceCategory(incident: Incident): boolean {
  return incident.category === 'communication_anomaly' || incident.category === 'satellite_service';
}

export function priorityFromScore(score: number): IncidentPriority {
  if (score >= PRIORITY_THRESHOLDS.critical) return 'critical';
  if (score >= PRIORITY_THRESHOLDS.high) return 'high';
  if (score >= PRIORITY_THRESHOLDS.medium) return 'medium';
  return 'low';
}

/**
 * Evaluate a candidate pair of incidents and produce a fully transparent,
 * rule-by-rule score breakdown.
 *
 * Design guarantees relied on by the rest of the app:
 *  - EVERY adjustment rule except geographicOverlap itself requires
 *    geographicOverlap to have already triggered. An incident with no
 *    geographic relationship to the other can therefore only ever receive
 *    zero adjustment — never a bonus, and never a penalty — so an unrelated
 *    event elsewhere can never move another incident's priority.
 *  - Unverified or simulated evidence is penalized, never rewarded.
 *  - Each rule can only fire once per evaluation — no double-counting.
 *  - The final score is always clamped to [0, 100].
 */
export function scoreCompoundPair(primary: Incident, secondary: Incident): ScoreBreakdown {
  const baseScore = Math.max(primary.baseSeverity, secondary.baseSeverity);
  const geo = geographicOverlap(primary, secondary);
  const temporal = temporalOverlap(primary, secondary);

  const rules: ScoringRuleResult[] = [];

  const geoTriggered = geo.overlap >= GEOGRAPHIC_OVERLAP_THRESHOLD;
  rules.push({
    ruleId: 'geographicOverlap',
    label: 'Geographic overlap',
    triggered: geoTriggered,
    pointsApplied: geoTriggered ? RULE_WEIGHTS.geographicOverlap : 0,
    explanation: geoTriggered
      ? `Incidents share overlapping geography (${Math.round(geo.overlap * 100)}% confidence, via ${geo.method.replace('_', ' ')}).`
      : `No meaningful geographic overlap detected (${Math.round(geo.overlap * 100)}%, via ${geo.method.replace('_', ' ')}) — unrelated-region incidents are not combined.`,
  });

  const temporalTriggered = geoTriggered && temporal.withinWindow;
  rules.push({
    ruleId: 'temporalOverlap',
    label: 'Temporal relevance',
    triggered: temporalTriggered,
    pointsApplied: temporalTriggered ? RULE_WEIGHTS.temporalOverlap : 0,
    explanation: temporalTriggered
      ? `Both reports fall within the ${TEMPORAL_RELEVANCE_WINDOW_MINUTES}-minute analysis window (${temporal.gapMinutes} min apart).`
      : `Reports are ${temporal.gapMinutes} min apart, outside the ${TEMPORAL_RELEVANCE_WINDOW_MINUTES}-minute window or geography did not overlap.`,
  });

  const criticalServiceTriggered =
    geoTriggered && (isCriticalServiceCategory(primary) || isCriticalServiceCategory(secondary));
  rules.push({
    ruleId: 'criticalServiceInvolved',
    label: 'Critical-service involvement',
    triggered: criticalServiceTriggered,
    pointsApplied: criticalServiceTriggered ? RULE_WEIGHTS.criticalServiceInvolved : 0,
    explanation: criticalServiceTriggered
      ? 'A communication or satellite-dependent service is involved in an overlapping incident — coordination impact is plausible.'
      : 'No overlapping communication or satellite-dependent service identified.',
  });

  // Everything below is a property of the EVIDENCE within an already-established
  // relationship — it must never fire on its own. An unverified or low-confidence
  // report sitting in a different region from the primary incident is irrelevant
  // to that incident's priority, so these rules all require geoTriggered too.
  // This is what guarantees an unrelated incident can only ever leave the score
  // at its base severity, never move it in either direction.

  const independentSourcesTriggered = geoTriggered && primary.source !== secondary.source;
  rules.push({
    ruleId: 'multipleIndependentSources',
    label: 'Independently sourced',
    triggered: independentSourcesTriggered,
    pointsApplied: independentSourcesTriggered ? RULE_WEIGHTS.multipleIndependentSources : 0,
    explanation: independentSourcesTriggered
      ? `Reported independently by "${primary.source}" and "${secondary.source}", increasing confidence in the signal.`
      : geoTriggered
        ? 'Both reports trace back to the same source.'
        : 'Not evaluated — no geographic relationship to corroborate.',
  });

  const lowDataQualityTriggered =
    geoTriggered && (primary.dataQuality.confidenceScore < 50 || secondary.dataQuality.confidenceScore < 50);
  rules.push({
    ruleId: 'lowDataQuality',
    label: 'Low data quality',
    triggered: lowDataQualityTriggered,
    pointsApplied: lowDataQualityTriggered ? RULE_WEIGHTS.lowDataQuality : 0,
    explanation: lowDataQualityTriggered
      ? 'At least one report has confidence below 50% — priority held back until data quality improves.'
      : geoTriggered
        ? 'Both reports meet the minimum data-quality bar.'
        : 'Not evaluated — no geographic relationship established.',
  });

  const unverifiedTriggered =
    geoTriggered && (primary.verification === 'unverified' || secondary.verification === 'unverified');
  rules.push({
    ruleId: 'unverifiedEvidence',
    label: 'Unverified evidence',
    triggered: unverifiedTriggered,
    pointsApplied: unverifiedTriggered ? RULE_WEIGHTS.unverifiedEvidence : 0,
    explanation: unverifiedTriggered
      ? 'At least one report is unverified — treated conservatively pending confirmation.'
      : geoTriggered
        ? 'Both reports carry a verified or simulated-and-labelled status.'
        : 'Not evaluated — no geographic relationship established.',
  });

  const simulatedOnlyTriggered =
    geoTriggered && primary.verification === 'simulated' && secondary.verification === 'simulated';
  rules.push({
    ruleId: 'simulatedOnly',
    label: 'Simulated-only pairing',
    triggered: simulatedOnlyTriggered,
    pointsApplied: simulatedOnlyTriggered ? RULE_WEIGHTS.simulatedOnly : 0,
    explanation: simulatedOnlyTriggered
      ? 'Both incidents are demonstration/simulated data — capped below a real-world verified pairing.'
      : geoTriggered
        ? 'At least one incident is a real-world (verified or unverified) report.'
        : 'Not evaluated — no geographic relationship established.',
  });

  const totalAdjustment = rules.reduce((sum, r) => sum + r.pointsApplied, 0);
  const finalScore = Math.min(
    SCORE_BOUNDS.max,
    Math.max(SCORE_BOUNDS.min, Math.round(baseScore + totalAdjustment)),
  );

  return {
    baseScore,
    rules,
    totalAdjustment,
    finalScore,
    finalPriority: priorityFromScore(finalScore),
  };
}
