import type { ScoreBreakdown } from '../../types/intelligence';
import { PriorityBadge } from '../shared/Badges';
import './ScoreBreakdownPanel.css';

export function ScoreBreakdownPanel({ score }: { score: ScoreBreakdown }) {
  return (
    <div className="score-breakdown">
      <div className="score-breakdown-head">
        <div className="score-breakdown-number">
          <span className="score-breakdown-value mono">{score.finalScore}</span>
          <span className="score-breakdown-scale text-muted mono">/100</span>
        </div>
        <PriorityBadge priority={score.finalPriority} />
      </div>

      <div className="score-breakdown-base text-muted">
        Base severity <span className="mono">{score.baseScore}</span> + rule adjustments{' '}
        <span className="mono">{score.totalAdjustment >= 0 ? '+' : ''}{score.totalAdjustment}</span>
      </div>

      <ul className="score-rules">
        {score.rules.map((rule) => (
          <li key={rule.ruleId} className={`score-rule${rule.triggered ? ' score-rule--active' : ''}`}>
            <div className="score-rule-top">
              <span className={`score-rule-dot ${rule.triggered ? (rule.pointsApplied >= 0 ? 'dot-low' : 'dot-critical') : 'dot-neutral'}`} />
              <span className="score-rule-label">{rule.label}</span>
              <span
                className={`score-rule-points mono ${rule.pointsApplied > 0 ? 'score-rule-points--pos' : rule.pointsApplied < 0 ? 'score-rule-points--neg' : ''}`}
              >
                {rule.triggered ? `${rule.pointsApplied >= 0 ? '+' : ''}${rule.pointsApplied}` : '—'}
              </span>
            </div>
            <div className="score-rule-explanation">{rule.explanation}</div>
          </li>
        ))}
      </ul>

      <p className="score-breakdown-disclaimer text-muted">
        This is a deterministic, rule-based demonstration score — a prototype prioritization aid, not a validated
        probability of disaster.
      </p>
    </div>
  );
}
