export type SourceCategory = 'space_weather' | 'earth_disaster' | 'communication' | 'satellite';

export type SourceDataStatus = 'live' | 'demo' | 'partial' | 'unavailable';

export interface DataSourceStatus {
  id: string;
  name: string;
  category: SourceCategory;
  status: SourceDataStatus;
  /** ISO 8601 timestamp of the last successful sync, or undefined if never synced. */
  lastSyncAt?: string;
  lastError?: string;
  description: string;
}

export interface SpaceWeatherIndicator {
  id: string;
  name: string;
  /** e.g. "G2", "R1", "S1", or "Quiet" */
  classification: string;
  level: 'quiet' | 'minor' | 'moderate' | 'strong';
  detail: string;
  observedAt: string;
  status: SourceDataStatus;
}

export interface SpaceWeatherSummary {
  status: SourceDataStatus;
  indicators: SpaceWeatherIndicator[];
  explanation: string;
  trend: { timestamp: string; kpIndex: number }[];
}

export interface DisasterSummary {
  status: SourceDataStatus;
  activeCount: number;
  byCategory: Record<string, number>;
}

export interface CommunicationIncidentSummary {
  status: SourceDataStatus;
  onlineServices: number;
  totalServices: number;
  degradedOrDown: number;
}
