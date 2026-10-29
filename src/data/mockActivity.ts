import type { ActivityEvent } from '../types/incident';

/**
 * Seed activity log. Each entry corresponds to a real incident in
 * mockIncidents.ts — the feed is never regenerated randomly on render.
 * Activity from simulated actions (e.g. "Simulate Outage") is appended to
 * this list at runtime by the app context, not invented here.
 */
export const mockActivity: ActivityEvent[] = [
  {
    id: 'act-001',
    type: 'relationship_identified',
    incidentId: 'EQ-2026-0001',
    message: 'Compound relationship identified: Flood Warning + Communication Outage overlap in Region A.',
    timestamp: 'T-4m',
  },
  {
    id: 'act-002',
    type: 'incident_received',
    incidentId: 'COM-2026-0031',
    message: 'New unverified report received: regional signal degradation in Region A.',
    timestamp: 'T-6m',
  },
  {
    id: 'act-003',
    type: 'incident_updated',
    incidentId: 'COM-2026-0014',
    message: 'Communication outage confirmed by Network Operations Center.',
    timestamp: 'T-5m',
  },
  {
    id: 'act-004',
    type: 'incident_updated',
    incidentId: 'EQ-2026-0001',
    message: 'Flood warning severity updated following new hydrological readings.',
    timestamp: 'T-9m',
  },
  {
    id: 'act-005',
    type: 'relationship_identified',
    incidentId: 'EQ-2026-0038',
    message: 'Aftershock series linked to original M5.2 earthquake event.',
    timestamp: 'T-140m',
  },
  {
    id: 'act-006',
    type: 'incident_received',
    incidentId: 'SW-2026-0005',
    message: 'G2-class geomagnetic storm watch issued by sample space-weather feed.',
    timestamp: 'T-172m',
  },
  {
    id: 'act-007',
    type: 'verification_changed',
    incidentId: 'DIS-2026-0051',
    message: 'Hurricane landfall watch track updated; confidence adjusted.',
    timestamp: 'T-310m',
  },
];
