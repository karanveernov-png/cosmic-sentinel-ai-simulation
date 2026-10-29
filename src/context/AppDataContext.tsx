import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { incidentService } from '../services/incidentService';
import { intelligenceService } from '../services/intelligenceService';
import { sourceService } from '../services/sourceService';
import type { ActivityEvent, Incident } from '../types/incident';
import type { CompoundThreatGroup } from '../types/intelligence';

interface AppDataState {
  incidents: Incident[];
  activity: ActivityEvent[];
  liveCompoundGroups: CompoundThreatGroup[];
  loading: boolean;
  simulating: boolean;
  error: string | null;
  lastSyncedAt: Date | null;
}

interface AppDataContextValue extends AppDataState {
  refresh: () => Promise<void>;
  simulateOutage: () => Promise<void>;
  resetDemo: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppDataState>({
    incidents: [],
    activity: [],
    liveCompoundGroups: [],
    loading: true,
    simulating: false,
    error: null,
    lastSyncedAt: null,
  });

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const [incidents, activity, liveCompoundGroups] = await Promise.all([
        incidentService.list(),
        incidentService.getActivity(),
        intelligenceService.listLiveCompoundGroups(),
      ]);
      setState({
        incidents,
        activity,
        liveCompoundGroups,
        loading: false,
        simulating: false,
        error: null,
        lastSyncedAt: new Date(),
      });
    } catch {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Unable to load incident data. Showing the last known state.',
      }));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const simulateOutage = useCallback(async () => {
    setState((prev) => ({ ...prev, simulating: true }));
    try {
      await sourceService.simulateCommunicationOutage();
      await load();
    } finally {
      setState((prev) => ({ ...prev, simulating: false }));
    }
  }, [load]);

  const resetDemo = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    await sourceService.resetDemoData();
    await load();
  }, [load]);

  const value = useMemo<AppDataContextValue>(
    () => ({ ...state, refresh: load, simulateOutage, resetDemo }),
    [state, load, simulateOutage, resetDemo],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within an AppDataProvider');
  return ctx;
}
