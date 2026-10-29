import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { CompoundThreatPanel } from '../components/dashboard/CompoundThreatPanel';
import { MetricCard } from '../components/dashboard/MetricCard';
import { StatusStrip } from '../components/dashboard/StatusStrip';
import { IncidentMap } from '../components/maps/IncidentMap';
import { useAppData } from '../context/AppDataContext';
import { useAsyncData } from '../hooks/useAsyncData';
import { intelligenceService } from '../services/intelligenceService';
import './OverviewPage.css';

export function OverviewPage() {
  const navigate = useNavigate();
  const { incidents, liveCompoundGroups, activity, loading } = useAppData();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: spaceWeather } = useAsyncData(() => intelligenceService.getSpaceWeather(), []);
  const { data: disasters } = useAsyncData(() => intelligenceService.getDisasterSummary(), [incidents.length]);
  const { data: communications } = useAsyncData(() => intelligenceService.getCommunicationSummary(), [incidents.length]);

  const metrics = useMemo(() => {
    const critical = incidents.filter((i) => i.priority === 'critical').length;
    const compound = incidents.filter((i) => i.isCompound).length;
    const unverified = incidents.filter((i) => i.verification === 'unverified').length;
    return { total: incidents.length, critical, compound, unverified };
  }, [incidents]);

  const situationSummary = useMemo(() => {
    if (incidents.length === 0) return 'No incidents are currently loaded.';
    const parts: string[] = [`Monitoring ${metrics.total} active incidents across the demonstration region set.`];
    if (liveCompoundGroups.length > 0) {
      const top = liveCompoundGroups[0];
      parts.push(
        `${liveCompoundGroups.length} scenario${liveCompoundGroups.length > 1 ? 's contain' : ' contains'} overlapping reports — the highest-priority is "${top.scenario.title}" in ${top.scenario.region}, which may warrant additional verification.`,
      );
    } else {
      parts.push('No overlapping or compounding relationships have been identified among current reports.');
    }
    if (metrics.unverified > 0) {
      parts.push(`${metrics.unverified} report${metrics.unverified > 1 ? 's remain' : ' remains'} unverified.`);
    }
    return parts.join(' ');
  }, [incidents.length, liveCompoundGroups, metrics]);

  const topGroup = liveCompoundGroups[0] ?? null;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Situation Overview</h1>
          <p className="page-subtitle">{situationSummary}</p>
        </div>
      </div>

      <div className="panel overview-metrics-panel">
        <div className="metric-strip">
          <MetricCard label="Active Incidents" value={metrics.total} tone="neutral" onClick={() => navigate('/incidents')} />
          <MetricCard
            label="Critical Priority"
            value={metrics.critical}
            tone="critical"
            onClick={() => navigate('/incidents?priority=critical')}
          />
          <MetricCard
            label="Compound Threats"
            value={metrics.compound}
            tone="high"
            onClick={() => navigate('/compound-intelligence')}
          />
          <MetricCard
            label="Unverified Reports"
            value={metrics.unverified}
            tone="medium"
            onClick={() => navigate('/incidents?verification=unverified')}
          />
        </div>
      </div>

      <div className="overview-main-grid">
        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">Global Incident Map</span>
            <span className="panel-note">{loading ? 'syncing…' : `${incidents.length} tracked`}</span>
          </div>
          <div className="panel-body">
            <IncidentMap incidents={incidents} selectedId={selectedId} onSelect={setSelectedId} />
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">Compound Threat Intelligence</span>
          </div>
          <div className="panel-body">
            <CompoundThreatPanel group={topGroup} />
          </div>
        </div>
      </div>

      <div className="overview-lower-grid">
        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">Recent Activity</span>
          </div>
          <div className="panel-body">
            <ActivityFeed events={activity} />
          </div>
        </div>

        <div className="panel overview-status-col">
          <div className="panel-head">
            <span className="panel-title">Source Status</span>
          </div>
          <div className="panel-body">
            <StatusStrip spaceWeather={spaceWeather} disasters={disasters} communications={communications} />
          </div>
        </div>
      </div>
    </div>
  );
}
