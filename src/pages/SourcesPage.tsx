import { RefreshCw, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { DataStatusBadge } from '../components/shared/Badges';
import { useAsyncData } from '../hooks/useAsyncData';
import { sourceService } from '../services/sourceService';
import { CATEGORY_LABELS } from '../utils/format';
import { formatRelativeTime } from '../utils/time';
import './SourcesPage.css';

const CATEGORY_DISPLAY: Record<string, string> = {
  space_weather: CATEGORY_LABELS.space_weather,
  earth_disaster: CATEGORY_LABELS.earth_disaster,
  communication: 'Communication',
  satellite: 'Satellite',
};

export function SourcesPage() {
  const { data: sources, loading, reload } = useAsyncData(() => sourceService.list(), []);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      reload();
      await new Promise((r) => setTimeout(r, 400));
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Data Sources</h1>
          <p className="page-subtitle">
            Every data source this build is configured to use, and its honest current status — refreshing never implies
            contacting a real external service while in demo mode.
          </p>
        </div>
        <button className="btn btn-sm" onClick={() => void handleRefresh()} disabled={refreshing || loading}>
          <RefreshCw size={13} className={refreshing ? 'spin' : undefined} />
          Refresh
        </button>
      </div>

      <div className="panel">
        {loading || !sources ? (
          <div className="empty-state">Loading sources…</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Category</th>
                <th>Status</th>
                <th>Last sync</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((source) => (
                <tr key={source.id} style={{ cursor: 'default' }}>
                  <td>
                    <div className="source-row-name">{source.name}</div>
                    <div className="text-muted source-row-desc">{source.description}</div>
                  </td>
                  <td className="text-secondary">{CATEGORY_DISPLAY[source.category] ?? source.category}</td>
                  <td><DataStatusBadge status={source.status} /></td>
                  <td className="text-muted mono">{source.lastSyncAt ? formatRelativeTime(source.lastSyncAt) : '—'}</td>
                  <td>
                    {source.lastError && (
                      <div className="source-row-error">
                        <TriangleAlert size={12} />
                        {source.lastError}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
