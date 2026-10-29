import { ArrowRight, CircleHelp } from 'lucide-react';
import type { CompoundThreatGroup } from '../../types/intelligence';
import { PriorityBadge, VerificationBadge } from '../shared/Badges';
import './CompoundThreatPanel.css';

export function CompoundThreatPanel({ group }: { group: CompoundThreatGroup | null }) {
  if (!group) {
    return (
      <div className="empty-state">
        No compound relationships detected in the current incident set. Incidents are being evaluated independently.
      </div>
    );
  }

  const [a, b] = group.incidents;

  return (
    <div className="compound-panel">
      <div className="compound-panel-chain">
        <div className="compound-chain-node">
          <PriorityBadge priority={a.priority} />
          <span className="compound-chain-title">{a.title}</span>
          <span className="text-muted">{a.region}</span>
        </div>
        <ArrowRight size={14} className="compound-chain-arrow" />
        <div className="compound-chain-node">
          <PriorityBadge priority={b.priority} />
          <span className="compound-chain-title">{b.title}</span>
          <span className="text-muted">{b.region}</span>
        </div>
      </div>

      <p className="compound-panel-summary">{group.scenario.relationshipSummary}</p>

      <div className="compound-panel-row">
        <span className="compound-panel-label">Potential implication</span>
        <p>{group.scenario.potentialImplication}</p>
      </div>

      <div className="compound-panel-row">
        <span className="compound-panel-label">Supporting evidence</span>
        <ul className="compound-evidence-list">
          {group.scenario.evidence.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      {group.scenario.uncertainty.length > 0 && (
        <div className="callout callout-amber">
          <CircleHelp size={14} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <strong>Uncertainty: </strong>
            {group.scenario.uncertainty.join(' ')}
          </div>
        </div>
      )}

      <div className="compound-panel-footer">
        <VerificationBadge state={a.verification} />
        <VerificationBadge state={b.verification} />
        <span className="compound-panel-score mono">
          Priority score {group.scenario.score.finalScore}/100
        </span>
      </div>
    </div>
  );
}
