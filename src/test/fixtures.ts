import type { Incident } from '../types/incident';

let counter = 0;

export function buildIncident(overrides: Partial<Incident> = {}): Incident {
  counter += 1;
  return {
    id: `TEST-${counter}`,
    title: 'Test incident',
    category: 'earth_disaster',
    region: 'Region A',
    reportedAt: '2026-10-28T14:00:00Z',
    source: 'Test Source',
    verification: 'verified',
    priority: 'medium',
    baseSeverity: 50,
    description: 'A test incident.',
    dataQuality: { confidenceScore: 80 },
    relationships: [],
    isCompound: false,
    ...overrides,
  };
}
