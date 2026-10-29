import { apiClient } from '../services/api/apiClient';
import type { ActivityEvent, Incident } from '../types/incident';
import type { CompoundThreatGroup, IntelligenceScenario } from '../types/intelligence';
import type { ResponsePlan } from '../types/response';
import type {
  CommunicationIncidentSummary,
  DataSourceStatus,
  DisasterSummary,
  SpaceWeatherSummary,
} from '../types/source';
import type { DataProvider } from './dataProvider';

/**
 * Talks to the real FastAPI backend once it exists. Endpoint paths below are
 * a reasonable proposal, not a fixed contract — adjust them to match
 * whatever the backend team actually implements. Every method's return type
 * is identical to `mockDataProvider`, so no UI code needs to change when
 * this provider is selected (see `src/config/environment.ts`).
 */
export const httpDataProvider: DataProvider = {
  getIncidents: () => apiClient.get<Incident[]>('/incidents'),
  getIncidentById: (id) => apiClient.get<Incident | null>(`/incidents/${id}`),

  getIntelligenceScenarios: () => apiClient.get<IntelligenceScenario[]>('/intelligence/scenarios'),
  getLiveCompoundGroups: () => apiClient.get<CompoundThreatGroup[]>('/intelligence/live-groups'),

  getSpaceWeather: () => apiClient.get<SpaceWeatherSummary>('/space-weather'),
  getDisasterSummary: () => apiClient.get<DisasterSummary>('/disasters/summary'),
  getCommunicationIncidents: () => apiClient.get<Incident[]>('/communications/incidents'),
  getCommunicationSummary: () => apiClient.get<CommunicationIncidentSummary>('/communications/summary'),

  getResponsePlans: () => apiClient.get<ResponsePlan[]>('/response-plans'),
  getSources: () => apiClient.get<DataSourceStatus[]>('/sources'),
  getActivity: () => apiClient.get<ActivityEvent[]>('/activity'),

  simulateCommunicationOutage: () =>
    apiClient.post<{ incident: Incident; activity: ActivityEvent }>('/demo/simulate-outage'),
  resetDemoData: () => apiClient.post<void>('/demo/reset'),
};
