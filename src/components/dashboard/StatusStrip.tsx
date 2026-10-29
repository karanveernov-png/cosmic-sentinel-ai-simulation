import { Globe2, Radio, Sun } from 'lucide-react';
import type { CommunicationIncidentSummary, DisasterSummary, SpaceWeatherSummary } from '../../types/source';
import { DataStatusBadge } from '../shared/Badges';
import './StatusStrip.css';

interface StatusStripProps {
  spaceWeather: SpaceWeatherSummary | null;
  disasters: DisasterSummary | null;
  communications: CommunicationIncidentSummary | null;
}

export function StatusStrip({ spaceWeather, disasters, communications }: StatusStripProps) {
  return (
    <div className="status-strip">
      <div className="status-strip-item">
        <Sun size={15} />
        <div className="status-strip-body">
          <div className="status-strip-top">
            <span>Space Weather</span>
            {spaceWeather && <DataStatusBadge status={spaceWeather.status} />}
          </div>
          <span className="text-muted">
            {spaceWeather ? `${spaceWeather.indicators.length} indicators tracked` : 'Loading…'}
          </span>
        </div>
      </div>

      <div className="status-strip-item">
        <Globe2 size={15} />
        <div className="status-strip-body">
          <div className="status-strip-top">
            <span>Earth Disasters</span>
            {disasters && <DataStatusBadge status={disasters.status} />}
          </div>
          <span className="text-muted">{disasters ? `${disasters.activeCount} active reports` : 'Loading…'}</span>
        </div>
      </div>

      <div className="status-strip-item">
        <Radio size={15} />
        <div className="status-strip-body">
          <div className="status-strip-top">
            <span>Communications</span>
            {communications && <DataStatusBadge status={communications.status} />}
          </div>
          <span className="text-muted">
            {communications ? `${communications.onlineServices}/${communications.totalServices} services online` : 'Loading…'}
          </span>
        </div>
      </div>
    </div>
  );
}
