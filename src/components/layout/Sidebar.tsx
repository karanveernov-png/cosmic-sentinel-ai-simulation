import {
  AlertTriangle,
  ClipboardList,
  Database,
  Globe2,
  LayoutDashboard,
  Network,
  Radio,
  Satellite,
  Sun,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAppData } from '../../context/AppDataContext';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/', label: 'Situation Overview', icon: LayoutDashboard, end: true },
  { to: '/incidents', label: 'Incident Intelligence', icon: AlertTriangle, end: false },
  { to: '/compound-intelligence', label: 'Compound Threats', icon: Network, end: false },
  { to: '/space-weather', label: 'Space Weather', icon: Sun, end: false },
  { to: '/earth-disasters', label: 'Earth Disasters', icon: Globe2, end: false },
  { to: '/communications', label: 'Communications', icon: Radio, end: false },
  { to: '/response-planning', label: 'Response Planning', icon: ClipboardList, end: false },
  { to: '/sources', label: 'Data Sources', icon: Database, end: false },
];

export function Sidebar() {
  const { incidents, liveCompoundGroups } = useAppData();
  const criticalCount = incidents.filter((i) => i.priority === 'critical').length;

  const badgeFor = (to: string): number | null => {
    if (to === '/incidents') return criticalCount || null;
    if (to === '/compound-intelligence') return liveCompoundGroups.length || null;
    return null;
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">
          <Satellite size={16} strokeWidth={2} />
        </div>
        <div>
          <div className="brand-name">SENTINEL FIELD</div>
          <div className="brand-tagline">Cosmic Sentinel AI</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Workspaces</div>
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => {
          const badge = badgeFor(to);
          return (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}>
              <Icon size={15} strokeWidth={1.9} className="nav-link-icon" />
              <span className="nav-link-label">{label}</span>
              {badge !== null && <span className="nav-link-badge">{badge}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-foot">
        <span>From Space Signals to Earth Safety</span>
        <span className="sidebar-foot-version">Space-to-Earth Intelligence Platform · v1.0.0-mvp</span>
      </div>
    </aside>
  );
}
