import type { IncidentCategory, IncidentPriority, VerificationState } from '../types/incident';
import type { SourceDataStatus } from '../types/source';

export const PRIORITY_LABELS: Record<IncidentPriority, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const CATEGORY_LABELS: Record<IncidentCategory, string> = {
  space_weather: 'Space Weather',
  earth_disaster: 'Earth Disaster',
  communication_anomaly: 'Communication Anomaly',
  satellite_service: 'Satellite Service',
  other: 'Other',
};

export const VERIFICATION_LABELS: Record<VerificationState, string> = {
  verified: 'Verified',
  unverified: 'Unverified',
  simulated: 'Simulated',
};

export const DATA_STATUS_LABELS: Record<SourceDataStatus, string> = {
  live: 'Live',
  demo: 'Demo',
  partial: 'Partial',
  unavailable: 'Unavailable',
};

export function titleCase(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
