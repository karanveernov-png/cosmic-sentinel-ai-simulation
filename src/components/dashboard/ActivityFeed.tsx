import type { ActivityEvent } from '../../types/incident';
import { formatRelativeTime } from '../../utils/time';
import './ActivityFeed.css';

const TYPE_DOT: Record<ActivityEvent['type'], string> = {
  incident_received: 'dot-medium',
  incident_updated: 'dot-high',
  relationship_identified: 'dot-critical',
  verification_changed: 'dot-low',
  incident_resolved: 'dot-neutral',
};

const TYPE_LABEL: Record<ActivityEvent['type'], string> = {
  incident_received: 'Received',
  incident_updated: 'Updated',
  relationship_identified: 'Relationship',
  verification_changed: 'Verification',
  incident_resolved: 'Resolved',
};

export function ActivityFeed({ events, limit = 8 }: { events: ActivityEvent[]; limit?: number }) {
  const shown = events.slice(0, limit);

  if (shown.length === 0) {
    return <div className="empty-state">No activity recorded yet.</div>;
  }

  return (
    <ul className="activity-feed">
      {shown.map((event) => (
        <li key={event.id} className="activity-item">
          <span className={`dot ${TYPE_DOT[event.type]}`} />
          <div className="activity-item-body">
            <div className="activity-item-top">
              <span className="activity-item-type">{TYPE_LABEL[event.type]}</span>
              <span className="activity-item-time mono">{formatRelativeTime(event.timestamp)}</span>
            </div>
            <div className="activity-item-message">{event.message}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}
