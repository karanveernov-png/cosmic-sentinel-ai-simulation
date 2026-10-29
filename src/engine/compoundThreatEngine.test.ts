import { describe, expect, it } from 'vitest';
import { buildIncident } from '../test/fixtures';
import { geographicOverlap, scoreCompoundPair, temporalOverlap } from './compoundThreatEngine';

describe('compoundThreatEngine — Scenario A: related events', () => {
  it('raises priority when a flood warning and a comms outage overlap geographically and temporally', () => {
    const flood = buildIncident({
      id: 'FLOOD-A',
      category: 'earth_disaster',
      region: 'Region A',
      reportedAt: '2026-10-28T14:00:00Z',
      baseSeverity: 60,
      verification: 'verified',
      source: 'National Weather Feed',
    });
    const outage = buildIncident({
      id: 'COMMS-A',
      category: 'communication_anomaly',
      region: 'Region A',
      reportedAt: '2026-10-28T14:15:00Z',
      baseSeverity: 55,
      verification: 'verified',
      source: 'Network Operations Center',
    });

    const result = scoreCompoundPair(flood, outage);

    expect(result.rules.find((r) => r.ruleId === 'geographicOverlap')?.triggered).toBe(true);
    expect(result.rules.find((r) => r.ruleId === 'temporalOverlap')?.triggered).toBe(true);
    expect(result.rules.find((r) => r.ruleId === 'criticalServiceInvolved')?.triggered).toBe(true);
    expect(result.finalScore).toBeGreaterThan(result.baseScore);
    expect(result.finalPriority).toBe('critical');
  });
});

describe('compoundThreatEngine — Scenario B: unrelated events', () => {
  it('does not escalate a flood warning because of an outage in a different region', () => {
    const flood = buildIncident({
      id: 'FLOOD-B',
      category: 'earth_disaster',
      region: 'Region A',
      reportedAt: '2026-10-28T14:00:00Z',
      baseSeverity: 60,
      coordinates: { lat: 23.8, lng: 90.4 },
    });
    const outage = buildIncident({
      id: 'COMMS-B',
      category: 'communication_anomaly',
      region: 'Region B',
      reportedAt: '2026-10-28T14:05:00Z',
      baseSeverity: 55,
      coordinates: { lat: -1.3, lng: 36.8 },
    });

    const geo = geographicOverlap(flood, outage);
    expect(geo.overlap).toBeLessThan(0.5);

    const result = scoreCompoundPair(flood, outage);
    expect(result.rules.find((r) => r.ruleId === 'geographicOverlap')?.triggered).toBe(false);
    expect(result.rules.find((r) => r.ruleId === 'temporalOverlap')?.triggered).toBe(false);
    // No geographic credit means the score should stay at-or-below the base severity.
    expect(result.finalScore).toBeLessThanOrEqual(result.baseScore);
  });
});

describe('compoundThreatEngine — Scenario C: uncertain / unverified events', () => {
  it('flags a possible relationship but keeps the score conservative when evidence is unverified', () => {
    const flood = buildIncident({
      id: 'FLOOD-C',
      category: 'earth_disaster',
      region: 'Region A',
      reportedAt: '2026-10-28T14:00:00Z',
      baseSeverity: 40,
      verification: 'verified',
    });
    const unverifiedReport = buildIncident({
      id: 'COMMS-C',
      category: 'communication_anomaly',
      region: 'Region A',
      reportedAt: '2026-10-28T14:10:00Z',
      baseSeverity: 35,
      verification: 'unverified',
    });

    const relatedResult = scoreCompoundPair(flood, unverifiedReport);
    const unverifiedRule = relatedResult.rules.find((r) => r.ruleId === 'unverifiedEvidence');

    expect(relatedResult.rules.find((r) => r.ruleId === 'geographicOverlap')?.triggered).toBe(true);
    expect(unverifiedRule?.triggered).toBe(true);
    expect(unverifiedRule?.pointsApplied).toBeLessThan(0);

    // Compare against an otherwise-identical verified pairing to prove the
    // engine is strictly more conservative when evidence is unverified.
    const verifiedReport = buildIncident({ ...unverifiedReport, id: 'COMMS-C-VERIFIED', verification: 'verified' });
    const verifiedResult = scoreCompoundPair(flood, verifiedReport);

    expect(relatedResult.finalScore).toBeLessThan(verifiedResult.finalScore);
  });
});

describe('scoreCompoundPair — general guarantees', () => {
  it('never produces a score outside [0, 100]', () => {
    const a = buildIncident({ baseSeverity: 100, region: 'Region Z' });
    const b = buildIncident({ baseSeverity: 100, region: 'Region Z', verification: 'unverified' });
    const result = scoreCompoundPair(a, b);
    expect(result.finalScore).toBeGreaterThanOrEqual(0);
    expect(result.finalScore).toBeLessThanOrEqual(100);
  });

  it('does not double-count the same rule', () => {
    const a = buildIncident({ region: 'Region Z' });
    const b = buildIncident({ region: 'Region Z' });
    const result = scoreCompoundPair(a, b);
    const ids = result.rules.map((r) => r.ruleId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('computes temporal gap correctly regardless of order', () => {
    const a = buildIncident({ reportedAt: '2026-10-28T14:00:00Z' });
    const b = buildIncident({ reportedAt: '2026-10-28T14:30:00Z' });
    expect(temporalOverlap(a, b).gapMinutes).toBe(30);
    expect(temporalOverlap(b, a).gapMinutes).toBe(30);
  });
});
