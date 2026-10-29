import { describe, expect, it } from 'vitest';
import { mockIncidents } from '../data/mockIncidents';
import { resolveRelativeTimestamp } from '../utils/time';
import { buildIntelligenceScenarios } from './scenarioBuilder';

const resolved = mockIncidents.map((i) => ({
  ...i,
  reportedAt: resolveRelativeTimestamp(i.reportedAt),
}));

describe('buildIntelligenceScenarios', () => {
  const scenarios = buildIntelligenceScenarios(resolved);

  it('produces exactly the three required demonstration scenarios', () => {
    expect(scenarios).toHaveLength(3);
    expect(scenarios.map((s) => s.kind).sort()).toEqual(['related', 'uncertain', 'unrelated']);
  });

  it('scores the related scenario higher than the unrelated scenario', () => {
    const related = scenarios.find((s) => s.kind === 'related')!;
    const unrelated = scenarios.find((s) => s.kind === 'unrelated')!;
    expect(related.score.finalScore).toBeGreaterThan(unrelated.score.finalScore);
  });

  it('scores the related scenario higher than the uncertain scenario', () => {
    const related = scenarios.find((s) => s.kind === 'related')!;
    const uncertain = scenarios.find((s) => s.kind === 'uncertain')!;
    expect(related.score.finalScore).toBeGreaterThan(uncertain.score.finalScore);
  });

  it('throws a clear error if a scenario references a missing incident id', () => {
    expect(() => buildIntelligenceScenarios([])).toThrow(/references an incident id/);
  });
});
