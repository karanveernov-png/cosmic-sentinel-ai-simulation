/**
 * Centralized environment configuration.
 *
 * To connect the real FastAPI backend once it exists:
 *   1. Set VITE_DATA_PROVIDER=http in your .env file (see .env.example).
 *   2. Set VITE_API_BASE_URL to the backend's base URL.
 *   3. Nothing else in the app needs to change — pages and components only
 *      ever talk to the services layer, which talks to whichever provider
 *      is selected here.
 */

export type DataProviderKind = 'mock' | 'http';

interface AppEnvironment {
  dataProvider: DataProviderKind;
  apiBaseUrl: string;
  /** Simulated network/processing latency for the mock provider, in ms. */
  mockLatencyMs: number;
  appVersion: string;
}

function readProviderKind(): DataProviderKind {
  const raw = import.meta.env.VITE_DATA_PROVIDER as string | undefined;
  return raw === 'http' ? 'http' : 'mock';
}

export const env: AppEnvironment = {
  dataProvider: readProviderKind(),
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8000/api',
  mockLatencyMs: Number(import.meta.env.VITE_MOCK_LATENCY_MS ?? 280),
  appVersion: '1.0.0-mvp',
};

export const isDemoMode = env.dataProvider === 'mock';
