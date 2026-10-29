import { Bell, FlaskConical, RefreshCw } from 'lucide-react';
import { isDemoMode } from '../../config/environment';
import { useAppData } from '../../context/AppDataContext';
import { useClock } from '../../hooks/useClock';
import { formatClock, formatClockDate, formatRelativeTime } from '../../utils/time';
import './Header.css';

export function Header() {
  const now = useClock();
  const { incidents, liveCompoundGroups, loading, lastSyncedAt, refresh } = useAppData();

  const criticalCount = incidents.filter((i) => i.priority === 'critical').length;

  return (
    <header className="app-header">
      <div className="header-clock">
        <span className="mono">{formatClock(now)}</span>
        <span className="header-date mono">{formatClockDate(now)}</span>
      </div>

      {isDemoMode && (
        <div className="demo-indicator" title="This build is running on a simulated demonstration dataset, not a live backend.">
          <FlaskConical size={12} strokeWidth={2} />
          Demo Mode
        </div>
      )}

      <div className="header-spacer" />

      <div className="header-stat" title="Total active incidents">
        <span className="header-stat-value">{incidents.length}</span>
        <span className="header-stat-label">incidents</span>
      </div>

      <div className="header-stat" title="Currently critical-priority incidents">
        <span className="header-stat-value header-stat-value--critical">{criticalCount}</span>
        <span className="header-stat-label">critical</span>
      </div>

      <div className="header-sync">
        <span className={`dot ${loading ? 'dot-medium pulse' : 'dot-low'}`} />
        {loading ? 'Syncing…' : lastSyncedAt ? `Synced ${formatRelativeTime(lastSyncedAt.toISOString(), now)}` : 'Not synced'}
      </div>

      <button className="icon-btn" title="Notifications — live compound threats" aria-label="Notifications">
        <Bell size={15} />
        {liveCompoundGroups.length > 0 && <span className="header-bell-badge">{liveCompoundGroups.length}</span>}
      </button>

      <button className="btn btn-sm" onClick={() => void refresh()} disabled={loading}>
        <RefreshCw size={13} className={loading ? 'spin' : undefined} />
        Refresh
      </button>
    </header>
  );
}
