import { Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { IncidentDetailPanel } from '../components/incidents/IncidentDetailPanel';
import { CompoundBadge, PriorityBadge, VerificationBadge } from '../components/shared/Badges';
import { useAppData } from '../context/AppDataContext';
import type { Incident, IncidentCategory, IncidentPriority, VerificationState } from '../types/incident';
import { CATEGORY_LABELS, PRIORITY_LABELS, VERIFICATION_LABELS } from '../utils/format';
import { formatRelativeTime } from '../utils/time';
import './IncidentIntelligencePage.css';

type SortKey = 'priority' | 'reportedAt' | 'severity';

const PRIORITY_ORDER: Record<IncidentPriority, number> = { critical: 0, high: 1, medium: 2, low: 3 };

function toggle<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export function IncidentIntelligencePage() {
  const { incidents, liveCompoundGroups } = useAppData();
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<Set<IncidentCategory>>(new Set());
  const [priorities, setPriorities] = useState<Set<IncidentPriority>>(() => {
    const p = searchParams.get('priority');
    return p ? new Set([p as IncidentPriority]) : new Set();
  });
  const [verifications, setVerifications] = useState<Set<VerificationState>>(() => {
    const v = searchParams.get('verification');
    return v ? new Set([v as VerificationState]) : new Set();
  });
  const [region, setRegion] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('priority');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const regions = useMemo(() => Array.from(new Set(incidents.map((i) => i.region))).sort(), [incidents]);

  const filtered = useMemo(() => {
    let list = incidents.slice();
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((i) => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.id.toLowerCase().includes(q));
    }
    if (categories.size > 0) list = list.filter((i) => categories.has(i.category));
    if (priorities.size > 0) list = list.filter((i) => priorities.has(i.priority));
    if (verifications.size > 0) list = list.filter((i) => verifications.has(i.verification));
    if (region !== 'all') list = list.filter((i) => i.region === region);

    list.sort((a, b) => {
      if (sortKey === 'priority') return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (sortKey === 'severity') return b.baseSeverity - a.baseSeverity;
      return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
    });
    return list;
  }, [incidents, search, categories, priorities, verifications, region, sortKey]);

  const selected: Incident | null = useMemo(
    () => filtered.find((i) => i.id === selectedId) ?? filtered[0] ?? null,
    [filtered, selectedId],
  );

  const clearFilters = () => {
    setSearch('');
    setCategories(new Set());
    setPriorities(new Set());
    setVerifications(new Set());
    setRegion('all');
  };

  const hasActiveFilters = search || categories.size > 0 || priorities.size > 0 || verifications.size > 0 || region !== 'all';

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Incident Intelligence</h1>
          <p className="page-subtitle">Search, filter, and inspect every incident currently on record — real, unverified, and simulated.</p>
        </div>
      </div>

      <div className="panel incident-filter-panel">
        <div className="incident-filter-row">
          <div className="incident-search">
            <Search size={14} />
            <input
              className="input"
              placeholder="Search by title, description, or ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select className="select incident-region-select" value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="all">All regions</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <select className="select" value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
            <option value="priority">Sort: Priority</option>
            <option value="reportedAt">Sort: Most recent</option>
            <option value="severity">Sort: Base severity</option>
          </select>

          {hasActiveFilters && (
            <button className="btn btn-sm" onClick={clearFilters}>
              <X size={12} /> Clear
            </button>
          )}
        </div>

        <div className="incident-chip-row">
          {(Object.keys(CATEGORY_LABELS) as IncidentCategory[]).map((c) => (
            <button
              key={c}
              className={`filter-chip${categories.has(c) ? ' filter-chip--active' : ''}`}
              onClick={() => setCategories((prev) => toggle(prev, c))}
            >
              {CATEGORY_LABELS[c]}
            </button>
          ))}
          <span className="chip-divider" />
          {(Object.keys(PRIORITY_LABELS) as IncidentPriority[]).map((p) => (
            <button
              key={p}
              className={`filter-chip${priorities.has(p) ? ' filter-chip--active' : ''}`}
              onClick={() => setPriorities((prev) => toggle(prev, p))}
            >
              {PRIORITY_LABELS[p]}
            </button>
          ))}
          <span className="chip-divider" />
          {(Object.keys(VERIFICATION_LABELS) as VerificationState[]).map((v) => (
            <button
              key={v}
              className={`filter-chip${verifications.has(v) ? ' filter-chip--active' : ''}`}
              onClick={() => setVerifications((prev) => toggle(prev, v))}
            >
              {VERIFICATION_LABELS[v]}
            </button>
          ))}
        </div>
      </div>

      <div className="incident-intel-grid">
        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">Incidents</span>
            <span className="panel-note">{filtered.length} of {incidents.length}</span>
          </div>
          {filtered.length === 0 ? (
            <div className="empty-state">No incidents match the current filters.</div>
          ) : (
            <div className="incident-table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Priority</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Region</th>
                    <th>Reported</th>
                    <th>Verification</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((incident) => (
                    <tr
                      key={incident.id}
                      className={selected?.id === incident.id ? 'selected' : ''}
                      onClick={() => setSelectedId(incident.id)}
                    >
                      <td><PriorityBadge priority={incident.priority} /></td>
                      <td>
                        <div className="incident-row-title">
                          {incident.title}
                          {incident.isCompound && <CompoundBadge />}
                        </div>
                      </td>
                      <td className="text-secondary">{CATEGORY_LABELS[incident.category]}</td>
                      <td className="text-secondary">{incident.region}</td>
                      <td className="text-muted mono">{formatRelativeTime(incident.reportedAt)}</td>
                      <td><VerificationBadge state={incident.verification} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="panel incident-detail-sticky">
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
