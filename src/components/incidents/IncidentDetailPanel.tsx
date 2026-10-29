import { MapPin } from 'lucide-react';
import type { CompoundThreatGroup } from '../../types/intelligence';
import type { Incident } from '../../types/incident';
import { CATEGORY_LABELS } from '../../utils/format';
import { formatRelativeTime, formatTimestamp } from '../../utils/time';
import { CompoundBadge, PriorityBadge, VerificationBadge } from '../shared/Badges';
import './IncidentDetailPanel.css';

interface IncidentDetailPanelProps {
  incident: Incident | null;
  relatedGroups?: CompoundThreatGroup[];
  onSelectRelated?: (id: string) => void;
}

export function IncidentDetailPanel({ incident, relatedGroups = [], onSelectRelated }: IncidentDetailPanelProps) {
  if (!incident) {
    return <div className="empty-state">Select an incident to inspect why it has its current priority.</div>;
  }

  const myGroups = relatedGroups.filter((g) => g.incidents.some((i) => i.id === incident.id));

  return (
    <div className="incident-detail">
      <div className="incident-detail-id mono text-muted">{incident.id}</div>
      <h3 className="incident-detail-title">{incident.title}</h3>

      <div className="incident-detail-badges">
        <PriorityBadge priority={incident.priority} />
        <VerificationBadge state={incident.verification} />
        {incident.isCompound && <CompoundBadge />}
      </div>

      <dl className="incident-detail-meta">
        <div>
          <dt>Category</dt>
          <dd>{CATEGORY_LABELS[incident.category]}</dd>
        </div>
        <div>
          <dt>Region</dt>
          <dd>{incident.region}</dd>
        </div>
        <div>
          <dt>Reported</dt>
          <dd title={formatTimestamp(incident.reportedAt)}>{formatRelativeTime(incident.reportedAt)}</dd>
        </div>
        <div>
          <dt>Source</dt>
          <dd>{incident.source}</dd>
        </div>
        <div>
          <dt>Base severity</dt>
          <dd className="mono">{incident.baseSeverity}/100</dd>
        </div>
        <div>
          <dt>Data confidence</dt>
          <dd className="mono">{incident.dataQuality.confidenceScore}%</dd>
        </div>
      </dl>

      {incident.coordinates && (
        <div className="incident-detail-coords">
          <MapPin size={12} />
          <span>
            {incident.coordinates.lat.toFixed(2)}, {incident.coordinates.lng.toFixed(2)}
            {incident.coordinates.precision ? ` — ${incident.coordinates.precision}` : ''}
          </span>
        </div>
      )}

      <p className="incident-detail-description">{incident.description}</p>

      {incident.dataQuality.limitation && (
        <div className="callout">
          <strong>Data-quality note:</strong> {incident.dataQuality.limitation}
        </div>
      )}

      {myGroups.length > 0 && (
        <div className="incident-detail-section">
          <div className="incident-detail-section-label">Identified relationships</div>
          {myGroups.map((group) => {
            const other = group.incidents.find((i) => i.id !== incident.id);
            if (!other) return null;
            return (
              <button key={group.scenario.id} className="incident-related-row" onClick={() => onSelectRelated?.(other.id)}>
                <PriorityBadge priority={other.priority} />
                <span className="incident-related-title">{other.title}</span>
                <span className="mono text-muted">{group.scenario.score.finalScore}/100</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
