import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet';
import type { Incident, IncidentCategory } from '../../types/incident';
import { CATEGORY_LABELS, PRIORITY_LABELS } from '../../utils/format';
import { formatRelativeTime } from '../../utils/time';
import { PriorityBadge, VerificationBadge } from '../shared/Badges';
import './IncidentMap.css';

const PRIORITY_COLOR: Record<string, string> = {
  critical: '#b84444',
  high: '#b7791f',
  medium: '#2f716e',
  low: '#34745a',
};

const CATEGORY_SHAPE: Record<IncidentCategory, string> = {
  earth_disaster: 'circle',
  communication_anomaly: 'diamond',
  space_weather: 'triangle',
  satellite_service: 'square',
  other: 'circle',
};

function buildDivIcon(incident: Incident, isSelected: boolean): L.DivIcon {
  const color = PRIORITY_COLOR[incident.priority] ?? '#647580';
  const shape = CATEGORY_SHAPE[incident.category];
  const selectedClass = isSelected ? ' map-marker--selected' : '';
  return L.divIcon({
    className: '',
    html: `<span class="map-marker map-marker--${shape}${selectedClass}" style="--marker-color:${color}"></span>`,
    iconSize: isSelected ? [20, 20] : [16, 16],
    iconAnchor: isSelected ? [10, 10] : [8, 8],
    popupAnchor: [0, -10],
  });
}

function TileWatcher({ onResult }: { onResult: (available: boolean) => void }) {
  const loaded = useRef(0);
  const errored = useRef(0);

  useMapEvents({
    tileload: () => {
      loaded.current += 1;
      onResult(true);
    },
    tileerror: () => {
      errored.current += 1;
    },
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (loaded.current === 0) onResult(false);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [onResult]);

  return null;
}

interface IncidentMapProps {
  incidents: Incident[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  height?: number;
}

const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as IncidentCategory[];

export function IncidentMap({ incidents, selectedId, onSelect, height = 380 }: IncidentMapProps) {
  const [tilesAvailable, setTilesAvailable] = useState<boolean | null>(null);
  const [activeCategories, setActiveCategories] = useState<Set<IncidentCategory>>(new Set(ALL_CATEGORIES));

  const located = useMemo(() => incidents.filter((i) => i.coordinates), [incidents]);
  const visible = useMemo(
    () => located.filter((i) => activeCategories.has(i.category)),
    [located, activeCategories],
  );

  const toggleCategory = (category: IncidentCategory) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  return (
    <div className="incident-map-wrap">
      <div className="map-filter-row">
        {ALL_CATEGORIES.map((category) => (
          <button
            key={category}
            className={`map-filter-chip${activeCategories.has(category) ? ' map-filter-chip--active' : ''}`}
            onClick={() => toggleCategory(category)}
          >
            <span className={`map-marker map-marker--${CATEGORY_SHAPE[category]} map-marker--chip`} />
            {CATEGORY_LABELS[category]}
          </button>
        ))}
      </div>

      <div className="incident-map-canvas" style={{ height }}>
        {tilesAvailable === false && (
          <div className="map-fallback">
            <div className="map-fallback-title">Map tiles unavailable</div>
            <p>
              Live map tiles could not be reached from this environment. The incident list below reflects the same
              {visible.length === located.length ? ' ' : ' filtered '}
              data the map would otherwise display.
            </p>
            <ul className="map-fallback-list">
              {visible.slice(0, 6).map((i) => (
                <li key={i.id} onClick={() => onSelect?.(i.id)}>
                  <PriorityBadge priority={i.priority} /> <span>{i.title}</span>
                  <span className="text-muted"> · {i.region}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <MapContainer
          center={[15, 20]}
          zoom={2}
          worldCopyJump
          style={{ height: '100%', width: '100%', visibility: tilesAvailable === false ? 'hidden' : 'visible' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={19}
          />
          <TileWatcher onResult={setTilesAvailable} />
          {visible.map((incident) => (
            <Marker
              key={incident.id}
              position={[incident.coordinates!.lat, incident.coordinates!.lng]}
              icon={buildDivIcon(incident, incident.id === selectedId)}
              eventHandlers={{ click: () => onSelect?.(incident.id) }}
            >
              <Popup>
                <div className="map-popup">
                  <div className="map-popup-title">{incident.title}</div>
                  <div className="map-popup-row">
                    <PriorityBadge priority={incident.priority} />
                    <VerificationBadge state={incident.verification} />
                  </div>
                  <div className="map-popup-meta">
                    {CATEGORY_LABELS[incident.category]} · {incident.region}
                  </div>
                  <div className="map-popup-meta">{formatRelativeTime(incident.reportedAt)}</div>
                  {incident.coordinates?.precision && (
                    <div className="map-popup-precision">Location: {incident.coordinates.precision}</div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="map-legend">
        <div className="map-legend-group">
          <span className="map-legend-label">Priority</span>
          {(['critical', 'high', 'medium', 'low'] as const).map((p) => (
            <span key={p} className="map-legend-item">
              <span className={`dot dot-${p}`} /> {PRIORITY_LABELS[p]}
            </span>
          ))}
        </div>
        <div className="map-legend-note text-muted">
          {visible.length} of {located.length} located incidents shown · markers are approximate, not precise disaster boundaries
        </div>
      </div>
    </div>
  );
}
