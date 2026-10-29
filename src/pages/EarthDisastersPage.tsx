import { useMemo, useState } from 'react';
import { IncidentDetailPanel } from '../components/incidents/IncidentDetailPanel';
import { IncidentMap } from '../components/maps/IncidentMap';
import { PriorityBadge, VerificationBadge } from '../components/shared/Badges';
import { useAppData } from '../context/AppDataContext';
import { formatRelativeTime } from '../utils/time';
import './EarthDisastersPage.css';

export function EarthDisastersPage() {
  const { incidents, liveCompoundGroups } = useAppData();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const disasters = useMemo(() => incidents.filter((i) => i.category === 'earth_disaster'), [incidents]);
  const selected = useMemo(
    () => disasters.find((i) => i.id === selectedId) ?? disasters[0] ?? null,
    [disasters, selectedId],
  );

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Earth Disasters</h1>
          <p className="page-subtitle">
            Official warnings, observed incidents, and simulated events — distinguished explicitly, never implied as prediction.
          </p>
        </div>
        <span className="panel-note">{disasters.length} tracked</span>
      </div>

      <div className="panel" style={{ marginBottom: 'var(--gap)' }}>
        <div className="panel-body">
          <IncidentMap incidents={disasters} selectedId={selectedId} onSelect={setSelectedId} height={320} />
        </div>
      </div>

      <div className="earth-disasters-grid">
        <div className="disaster-card-list">
          {disasters.length === 0 ? (
            <div className="panel"><div className="empty-state">No earth-disaster incidents on record.</div></div>
          ) : (
            disasters.map((incident) => (
              <button
                key={incident.id}
                className={`panel disaster-card${selected?.id === incident.id ? ' disaster-card--active' : ''}`}
                onClick={() => setSelectedId(incident.id)}
              >
                <div className="disaster-card-top">
                  <PriorityBadge priority={incident.priority} />
                  <VerificationBadge state={incident.verification} />
                  <span className="text-muted mono disaster-card-time">{formatRelativeTime(incident.reportedAt)}</span>
                </div>
                <div className="disaster-card-title">{incident.title}</div>
                <div className="text-muted disaster-card-region">{incident.region} · {incident.source}</div>
              </button>
            ))
          )}
        </div>

        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">Detail</span>
          </div>
          <div className="panel-body">
            <IncidentDetailPanel incident={selected} relatedGroups={liveCompoundGroups} onSelectRelated={setSelectedId} />
          </div>
        </div>
      </div>
    </div>
  );
}
