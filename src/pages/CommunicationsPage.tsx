import { RotateCcw, Zap } from 'lucide-react';
import { useMemo, useState } from 'react';
import { IncidentDetailPanel } from '../components/incidents/IncidentDetailPanel';
import { PriorityBadge, VerificationBadge } from '../components/shared/Badges';
import { useAppData } from '../context/AppDataContext';
import { formatRelativeTime } from '../utils/time';
import './CommunicationsPage.css';

export function CommunicationsPage() {
  const { incidents, liveCompoundGroups, simulating, simulateOutage, resetDemo, loading } = useAppData();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  const comms = useMemo(() => incidents.filter((i) => i.category === 'communication_anomaly'), [incidents]);
  const selected = useMemo(() => comms.find((i) => i.id === selectedId) ?? comms[0] ?? null, [comms, selectedId]);

  const handleReset = async () => {
    setResetting(true);
    try {
      await resetDemo();
      setSelectedId(null);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Communications</h1>
          <p className="page-subtitle">
            Verified, unverified, and simulated communication anomalies. Use the controls below to exercise the live demo
            workflow.
          </p>
        </div>
        <div className="comms-actions">
          <button className="btn btn-sm" onClick={() => void handleReset()} disabled={resetting || loading}>
            <RotateCcw size={13} />
            Reset Demo
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => void simulateOutage()} disabled={simulating}>
            <Zap size={13} />
            {simulating ? 'Simulating…' : 'Simulate Communication Outage'}
          </button>
        </div>
      </div>

      <div className="callout" style={{ marginBottom: 'var(--gap)' }}>
        <strong>Demonstration control:</strong> "Simulate Communication Outage" creates a new, clearly labelled simulated
        incident, adds it to the live incident set, and immediately re-evaluates it against every other active incident for
        compound relationships — the same engine used everywhere else in this app.
      </div>

      <div className="comms-grid">
        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">Communication Anomalies</span>
            <span className="panel-note">{comms.length} tracked</span>
          </div>
          {comms.length === 0 ? (
            <div className="empty-state">No communication anomalies on record. Try the simulate action above.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Priority</th>
                  <th>Title</th>
                  <th>Region</th>
                  <th>Reported</th>
                  <th>Verification</th>
                </tr>
              </thead>
              <tbody>
                {comms.map((incident) => (
                  <tr key={incident.id} className={selected?.id === incident.id ? 'selected' : ''} onClick={() => setSelectedId(incident.id)}>
                    <td><PriorityBadge priority={incident.priority} /></td>
                    <td className="text-primary">{incident.title}</td>
                    <td className="text-secondary">{incident.region}</td>
                    <td className="text-muted mono">{formatRelativeTime(incident.reportedAt)}</td>
                    <td><VerificationBadge state={incident.verification} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
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
