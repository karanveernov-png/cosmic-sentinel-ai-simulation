import type { ActivityEvent, Incident } from '../types/incident';
import type { CompoundThreatGroup, IntelligenceScenario } from '../types/intelligence';
import type { ResponsePlan } from '../types/response';
import type {
  CommunicationIncidentSummary,
  DataSourceStatus,
  DisasterSummary,
  SpaceWeatherSummary,
} from '../types/source';

/**
 * Every page and component in this app talks to data exclusively through a
 * `DataProvider`. Swapping `mockDataProvider` for `httpDataProvider` (via
 * `src/config/environment.ts`) should be the ONLY change required to point
 * the frontend at the real FastAPI backend — no component should import
 * mock data or a provider implementation directly.
 */
export interface DataProvider {
  getIncidents(): Promise<Incident[]>;
  getIncidentById(id: string): Promise<Incident | null>;

  /** The three curated demonstration scenarios (related / unrelated / uncertain). */
  getIntelligenceScenarios(): Promise<IntelligenceScenario[]>;
  /** Live, dynamically detected compound relationships across the current incident set. */
  getLiveCompoundGroups(): Promise<CompoundThreatGroup[]>;

  getSpaceWeather(): Promise<SpaceWeatherSummary>;
  getDisasterSummary(): Promise<DisasterSummary>;
  getCommunicationIncidents(): Promise<Incident[]>;
  getCommunicationSummary(): Promise<CommunicationIncidentSummary>;

  getResponsePlans(): Promise<ResponsePlan[]>;
  getSources(): Promise<DataSourceStatus[]>;
  getActivity(): Promise<ActivityEvent[]>;

  /**
   * Demonstration-only action: creates a new simulated communication-anomaly
   * incident, appends an activity event, and returns both so the caller can
   * update shared app state. The HTTP provider would implement this as a
   * POST against a demo-seeding endpoint, if the backend chooses to expose one.
   */
  simulateCommunicationOutage(): Promise<{ incident: Incident; activity: ActivityEvent }>;

  /** Demonstration-only action: restores the dataset to its original seed state. */
  resetDemoData(): Promise<void>;
}
