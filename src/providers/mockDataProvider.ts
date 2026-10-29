import { mockActivity } from '../data/mockActivity';
import { mockIncidents } from '../data/mockIncidents';
import { mockSources } from '../data/mockSources';
import { mockSpaceWeather } from '../data/mockSpaceWeather';
import { detectCompoundGroups } from '../engine/compoundDetection';
import { buildResponsePlans } from '../engine/responsePlanBuilder';
import { buildIntelligenceScenarios } from '../engine/scenarioBuilder';
import type { ActivityEvent, Incident } from '../types/incident';
import type { CompoundThreatGroup, IntelligenceScenario } from '../types/intelligence';
import type { ResponsePlan } from '../types/response';
import type {
  CommunicationIncidentSummary,
  DataSourceStatus,
  DisasterSummary,
  SpaceWeatherSummary,
} from '../types/source';
import { env } from '../config/environment';
import { resolveRelativeTimestamp } from '../utils/time';
import type { DataProvider } from './dataProvider';

const SIMULATED_REGIONS = ['Region A — South Delta Basin', 'Region E — Highland Pass', 'Region H — River Confluence'];

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), env.mockLatencyMs));
}

function resolveIncidentTimestamps(incident: Incident, anchor: Date): Incident {
  return {
    ...incident,
    reportedAt: resolveRelativeTimestamp(incident.reportedAt, anchor),
    updatedAt: incident.updatedAt ? resolveRelativeTimestamp(incident.updatedAt, anchor) : undefined,
  };
}

function seedStore(): { incidents: Incident[]; activity: ActivityEvent[]; sources: DataSourceStatus[]; anchor: Date } {
  const anchor = new Date();
  return {
    incidents: mockIncidents.map((incident) => resolveIncidentTimestamps(incident, anchor)),
    activity: mockActivity.map((a) => ({ ...a, timestamp: resolveRelativeTimestamp(a.timestamp, anchor) })),
    sources: mockSources.map((s) => ({
      ...s,
      lastSyncAt: s.lastSyncAt ? resolveRelativeTimestamp(s.lastSyncAt, anchor) : undefined,
    })),
    anchor,
  };
}

let store = seedStore();

function applyLiveCompoundFlags(incidents: Incident[]): Incident[] {
  const groups = detectCompoundGroups(incidents);
  const compoundIds = new Set(groups.flatMap((g) => g.incidents.map((i) => i.id)));
  return incidents.map((incident) => ({ ...incident, isCompound: compoundIds.has(incident.id) }));
}

export const mockDataProvider: DataProvider = {
  async getIncidents() {
    return delay(applyLiveCompoundFlags(store.incidents));
  },

  async getIncidentById(id: string) {
    const incident = store.incidents.find((i) => i.id === id) ?? null;
    return delay(incident ? applyLiveCompoundFlags([incident])[0] : null);
  },

  async getIntelligenceScenarios(): Promise<IntelligenceScenario[]> {
    return delay(buildIntelligenceScenarios(store.incidents));
  },

  async getLiveCompoundGroups(): Promise<CompoundThreatGroup[]> {
    return delay(detectCompoundGroups(store.incidents));
  },

  async getSpaceWeather(): Promise<SpaceWeatherSummary> {
    const resolved: SpaceWeatherSummary = {
      ...mockSpaceWeather,
      indicators: mockSpaceWeather.indicators.map((ind) => ({
        ...ind,
        observedAt: resolveRelativeTimestamp(ind.observedAt, store.anchor),
      })),
      trend: mockSpaceWeather.trend.map((t) => ({ ...t, timestamp: resolveRelativeTimestamp(t.timestamp, store.anchor) })),
    };
    return delay(resolved);
  },

  async getDisasterSummary(): Promise<DisasterSummary> {
    const disasters = store.incidents.filter((i) => i.category === 'earth_disaster');
    const byCategory: Record<string, number> = {};
    for (const incident of store.incidents) {
      byCategory[incident.category] = (byCategory[incident.category] ?? 0) + 1;
    }
    return delay({ status: 'demo', activeCount: disasters.length, byCategory });
  },

  async getCommunicationIncidents(): Promise<Incident[]> {
    return delay(applyLiveCompoundFlags(store.incidents).filter((i) => i.category === 'communication_anomaly'));
  },

  async getCommunicationSummary(): Promise<CommunicationIncidentSummary> {
    const totalServices = 13;
    const commIncidents = store.incidents.filter((i) => i.category === 'communication_anomaly');
    const degradedOrDown = commIncidents.length;
    return delay({
      status: 'demo',
      totalServices,
      degradedOrDown,
      onlineServices: Math.max(0, totalServices - degradedOrDown),
    });
  },

  async getResponsePlans(): Promise<ResponsePlan[]> {
    const scenarios = buildIntelligenceScenarios(store.incidents);
    return delay(buildResponsePlans(scenarios, new Date().toISOString()));
  },

  async getSources(): Promise<DataSourceStatus[]> {
    return delay(store.sources);
  },

  async getActivity(): Promise<ActivityEvent[]> {
    const sorted = [...store.activity].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
    return delay(sorted);
  },

  async simulateCommunicationOutage(): Promise<{ incident: Incident; activity: ActivityEvent }> {
    const region = SIMULATED_REGIONS[Math.floor(Math.random() * SIMULATED_REGIONS.length)];
    const now = new Date();
    const id = `SIM-${now.getTime()}`;

    const incident: Incident = {
      id,
      title: 'Simulated Communication Outage',
      category: 'communication_anomaly',
      region,
      reportedAt: now.toISOString(),
      source: 'Demonstration Event Generator',
      verification: 'simulated',
      priority: 'medium',
      baseSeverity: 35 + Math.round(Math.random() * 25),
      description:
        'Demonstration incident created via the "Simulate Communication Outage" control. Clearly labelled as simulated — not a real-world observation.',
      dataQuality: { confidenceScore: 100, limitation: 'Simulated data — not a real-world observation.' },
      relationships: [],
      isCompound: false,
    };

    const activity: ActivityEvent = {
      id: `act-sim-${now.getTime()}`,
      type: 'incident_received',
      incidentId: id,
      message: `Simulated communication outage generated for ${region}.`,
      timestamp: now.toISOString(),
    };

    store = {
      ...store,
      incidents: [incident, ...store.incidents],
      activity: [activity, ...store.activity],
    };

    return delay({ incident, activity });
  },

  async resetDemoData(): Promise<void> {
    store = seedStore();
    return delay(undefined);
  },
};
