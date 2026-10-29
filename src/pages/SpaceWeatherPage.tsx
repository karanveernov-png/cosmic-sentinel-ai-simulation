import { Info } from 'lucide-react';
import { KpTrendChart } from '../components/charts/KpTrendChart';
import { DataStatusBadge } from '../components/shared/Badges';
import { useAsyncData } from '../hooks/useAsyncData';
import { intelligenceService } from '../services/intelligenceService';
import { formatRelativeTime } from '../utils/time';
import './SpaceWeatherPage.css';

const LEVEL_CLASS: Record<string, string> = {
  quiet: 'badge-low',
  minor: 'badge-medium',
  moderate: 'badge-high',
  strong: 'badge-critical',
};

export function SpaceWeatherPage() {
  const { data, loading } = useAsyncData(() => intelligenceService.getSpaceWeather(), []);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Space Weather</h1>
          <p className="page-subtitle">Solar and geomagnetic indicators relevant to satellite-dependent and high-latitude technological services.</p>
        </div>
        {data && <DataStatusBadge status={data.status} />}
      </div>

      {loading || !data ? (
        <div className="panel"><div className="empty-state">Loading space-weather indicators…</div></div>
      ) : data.indicators.length === 0 ? (
        <div className="panel"><div className="empty-state">No space-weather indicators are currently available.</div></div>
      ) : (
        <div className="space-weather-grid">
          <div className="panel">
            <div className="panel-head">
              <span className="panel-title">Indicators</span>
              <span className="panel-note">sample feed</span>
            </div>
            <div className="panel-body sw-indicator-list">
              {data.indicators.map((indicator) => (
                <div key={indicator.id} className="sw-indicator-row">
                  <div className="sw-indicator-main">
                    <div className="sw-indicator-name">{indicator.name}</div>
                    <div className="text-muted">{indicator.detail}</div>
                  </div>
                  <div className="sw-indicator-side">
                    <span className={`badge ${LEVEL_CLASS[indicator.level]}`}>{indicator.classification}</span>
                    <span className="text-muted mono">{formatRelativeTime(indicator.observedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <span className="panel-title">Kp Index Trend</span>
            </div>
            <div className="panel-body">
              <KpTrendChart data={data.trend} />
            </div>
          </div>

          <div className="panel space-weather-explanation">
            <div className="panel-head">
              <Info size={14} />
              <span className="panel-title">What this does and doesn't tell you</span>
            </div>
            <div className="panel-body">
              <p>{data.explanation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
