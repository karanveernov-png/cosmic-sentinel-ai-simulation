import { CircleCheck, CircleHelp, CircleX } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ScoreBreakdownPanel } from '../components/dashboard/ScoreBreakdownPanel';
import { PriorityBadge, VerificationBadge } from '../components/shared/Badges';
import { useAppData } from '../context/AppDataContext';
import { useAsyncData } from '../hooks/useAsyncData';
import { intelligenceService } from '../services/intelligenceService';
import type { ScenarioKind } from '../types/intelligence';
import './CompoundIntelligencePage.css';

const KIND_META: Record<ScenarioKind, { label: string; icon: typeof CircleCheck; tone: string }> = {
  related: { label: 'Related events', icon: CircleCheck, tone: 'badge-critical' },
  unrelated: { label: 'Unrelated events', icon: CircleX, tone: 'badge-low' },
  uncertain: { label: 'Uncertain / unverified', icon: CircleHelp, tone: 'badge-high' },
};

export function CompoundIntelligencePage() {
  const { incidents } = useAppData();
  const { data: scenarios, loading } = useAsyncData(() => intelligenceService.listScenarios(), []);
  const [activeId, setActiveId] = useState<string | null>(null);

  const active = useMemo(() => {
    if (!scenarios) return null;
    return scenarios.find((s) => s.id === activeId) ?? scenarios[0] ?? null;
  }, [scenarios, activeId]);

  const activeIncidents = useMemo(() => {
    if (!active) return [];
    return active.incidentIds.map((id) => incidents.find((i) => i.id === id)).filter((i): i is NonNullable<typeof i> => !!i);
  }, [active, incidents]);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Compound Threat Intelligence</h1>
          <p className="page-subtitle">
            Three fixed demonstration scenarios, scored live by the same deterministic engine — proving the system escalates
            related events, leaves unrelated ones alone, and stays conservative under uncertainty.
          </p>
        </div>
      </div>

      {loading || !scenarios ? (
        <div className="panel"><div className="empty-state">Loading scenarios…</div></div>
      ) : (
        <>
          <div className="scenario-selector">
            {scenarios.map((scenario) => {
              const meta = KIND_META[scenario.kind];
              const Icon = meta.icon;
              const isActive = active?.id === scenario.id;
              return (
                <button
                  key={scenario.id}
                  className={`scenario-tile${isActive ? ' scenario-tile--active' : ''}`}
                  onClick={() => setActiveId(scenario.id)}
                >
                  <div className="scenario-tile-head">
                    <Icon size={15} />
                    <span className={`badge ${meta.tone}`}>{meta.label}</span>
                  </div>
                  <div className="scenario-tile-title">{scenario.title}</div>
                  <div className="scenario-tile-region text-muted">{scenario.region}</div>
                  <div className="scenario-tile-score mono">
                    Score {scenario.score.finalScore} · <PriorityBadge priority={scenario.score.finalPriority} />
                  </div>
                </button>
              );
            })}
          </div>

          {active && (
            <div className="compound-detail-grid">
              <div className="panel">
                <div className="panel-head">
                  <span className="panel-title">Relationship</span>
                </div>
                <div className="panel-body">
                  <div className="scenario-chain">
                    {activeIncidents.map((incident, idx) => (
                      <div key={incident.id} className="scenario-chain-item">
                        {idx > 0 && <span className="scenario-chain-connector" aria-hidden>⟷</span>}
                        <div className="scenario-chain-card">
                          <PriorityBadge priority={incident.priority} />
                          <VerificationBadge state={incident.verification} />
                          <div className="scenario-chain-card-title">{incident.title}</div>
                          <div className="text-muted">{incident.region}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="scenario-summary">{active.relationshipSummary}</p>

                  <div className="scenario-section">
                    <span className="scenario-section-label">Potential operational implication</span>
                    <p>{active.potentialImplication}</p>
                  </div>

                  <div className="scenario-section">
                    <span className="scenario-section-label">Evidence</span>
                    <ul>
                      {active.evidence.map((e) => (
                        <li key={e}>{e}</li>
                      ))}
                    </ul>
                  </div>

                  {active.uncertainty.length > 0 && (
                    <div className="scenario-section">
                      <span className="scenario-section-label">Uncertainty</span>
                      <ul>
                        {active.uncertainty.map((u) => (
                          <li key={u}>{u}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="scenario-section">
                    <span className="scenario-section-label">Recommended verification</span>
                    <ul>
                      {active.recommendedVerification.map((v) => (
                        <li key={v}>{v}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-head">
                  <span className="panel-title">Transparent Scoring</span>
                </div>
                <div className="panel-body">
                  <ScoreBreakdownPanel score={active.score} />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
