import type { Incident } from '../types/incident';
import type { CompoundThreatGroup, IntelligenceScenario } from '../types/intelligence';
import { CATEGORY_LABELS } from '../utils/format';
import { geographicOverlap, scoreCompoundPair } from './compoundThreatEngine';
import { GEOGRAPHIC_OVERLAP_THRESHOLD } from './scoringConfig';

/**
 * Scans the live incident set for cross-category pairs whose geography
 * overlaps, and scores each one through the same engine used by the curated
 * demonstration scenarios. This is what powers the Overview compound panel
 * and what re-runs after a "Simulate Communication Outage" action — so a
 * newly simulated incident is evaluated against everything already on the
 * board, not just hardcoded into a fixed scenario.
 *
 * Only cross-category pairs are considered: two flood reports in the same
 * region are not a "compound threat" in the sense this project cares about,
 * they're the same kind of event reported twice.
 */
export function detectCompoundGroups(incidents: Incident[]): CompoundThreatGroup[] {
  const groups: CompoundThreatGroup[] = [];

  for (let i = 0; i < incidents.length; i += 1) {
    for (let j = i + 1; j < incidents.length; j += 1) {
      const a = incidents[i];
      const b = incidents[j];
      if (a.category === b.category) continue;

      const geo = geographicOverlap(a, b);
      if (geo.overlap < GEOGRAPHIC_OVERLAP_THRESHOLD) continue;

      const score = scoreCompoundPair(a, b);
      const unverifiedInvolved = a.verification === 'unverified' || b.verification === 'unverified';
      const criticalServiceRule = score.rules.find((r) => r.ruleId === 'criticalServiceInvolved');

      const scenario: IntelligenceScenario = {
        id: `live-${a.id}-${b.id}`,
        kind: unverifiedInvolved ? 'uncertain' : 'related',
        title: `${CATEGORY_LABELS[a.category]} + ${CATEGORY_LABELS[b.category]}`,
        region: a.region === b.region ? a.region : `${a.region} / ${b.region}`,
        incidentIds: [a.id, b.id],
        relationshipSummary: `${a.title} overlaps geographically and temporally with ${b.title}.`,
        potentialImplication: criticalServiceRule?.triggered
          ? 'If the affected communication or satellite-dependent service remains impaired, response coordination in the overlapping region could become more difficult.'
          : 'These reports share overlapping geography and timing — worth monitoring for compounding operational impact even though no critical service has been flagged yet.',
        evidence: score.rules.filter((r) => r.triggered).map((r) => r.explanation),
        uncertainty: unverifiedInvolved
          ? ['At least one of the overlapping reports is unverified and should be corroborated before acting on the combination.']
          : [],
        recommendedVerification: [
          'Confirm current status and scope of both reports.',
          'Check whether the affected service is relevant to emergency coordination in this region.',
        ],
        score,
      };

      groups.push({ scenario, incidents: [a, b] });
    }
  }

  return groups.sort((x, y) => y.scenario.score.finalScore - x.scenario.score.finalScore);
}
