import { Printer } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PriorityBadge } from '../components/shared/Badges';
import { useAsyncData } from '../hooks/useAsyncData';
import { responseService } from '../services/responseService';
import { formatTimestamp } from '../utils/time';
import './ResponsePlanningPage.css';

export function ResponsePlanningPage() {
  const { data: plans, loading } = useAsyncData(() => responseService.listPlans(), []);
  const [activeId, setActiveId] = useState<string | null>(null);

  const active = useMemo(() => {
    if (!plans) return null;
    return plans.find((p) => p.id === activeId) ?? plans[0] ?? null;
  }, [plans, activeId]);

  return (
    <div className="page">
      <div className="rp-screen-only">
        <div className="page-head">
          <div>
            <h1 className="page-title">Response Planning</h1>
            <p className="page-subtitle">
              Priority-ordered scenarios translated into verification and coordination checks — decision support, not
              autonomous emergency instructions.
            </p>
          </div>
        </div>

        {loading || !plans ? (
          <div className="panel"><div className="empty-state">Loading response plans…</div></div>
        ) : (
          <div className="rp-grid">
            <div className="rp-plan-list">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  className={`panel rp-plan-item${active?.id === plan.id ? ' rp-plan-item--active' : ''}`}
                  onClick={() => setActiveId(plan.id)}
                >
                  <div className="rp-plan-item-top">
                    <PriorityBadge priority={plan.priority} />
                    <span className="text-muted mono">{plan.region}</span>
                  </div>
                  <div className="rp-plan-item-title">{plan.title}</div>
                </button>
              ))}
            </div>

            {active && (
              <div className="panel">
                <div className="panel-head">
                  <span className="panel-title">{active.title}</span>
                  <button className="btn btn-sm" onClick={() => window.print()}>
                    <Printer size={13} /> Generate Report
                  </button>
                </div>
                <div className="panel-body">
                  <div className="rp-detail-top">
                    <PriorityBadge priority={active.priority} />
                    <span className="text-muted">{active.region}</span>
                  </div>

                  <p className="rp-summary">{active.summary}</p>

                  <div className="rp-section">
                    <span className="rp-section-label">Why this priority</span>
                    <p>{active.reasonForPriority}</p>
                  </div>

                  <div className="rp-section">
                    <span className="rp-section-label">Evidence</span>
                    <ul>
                      {active.evidence.map((e) => (
                        <li key={e}>{e}</li>
                      ))}
                    </ul>
                  </div>

                  {active.uncertainties.length > 0 && (
                    <div className="rp-section">
                      <span className="rp-section-label">Uncertainties</span>
                      <ul>
                        {active.uncertainties.map((u) => (
                          <li key={u}>{u}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="rp-section">
                    <span className="rp-section-label">Recommended verification steps</span>
                    <ol>
                      {active.verificationSteps.map((step) => (
                        <li key={step.id}>{step.label}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="rp-section">
                    <span className="rp-section-label">Coordination checks</span>
                    <ol>
                      {active.coordinationChecks.map((step) => (
                        <li key={step.id}>{step.label}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="rp-generated text-muted mono">Generated {formatTimestamp(active.generatedAt)}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {active && (
        <div className="rp-print-only">
          <h1>{active.title}</h1>
          <p className="rp-print-meta">
            Incident group reference: <strong>{active.scenarioId}</strong> · Region: <strong>{active.region}</strong> ·
            Priority: <strong>{active.priority.toUpperCase()}</strong>
          </p>
          <p className="rp-print-demo-note">
            This report is generated from a hackathon demonstration dataset. Any incident marked "Simulated" elsewhere in
            this application is not a real-world observation.
          </p>

          <h2>Summary</h2>
          <p>{active.summary}</p>

          <h2>Why this priority</h2>
          <p>{active.reasonForPriority}</p>

          <h2>Evidence</h2>
          <ul>
            {active.evidence.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>

          {active.uncertainties.length > 0 && (
            <>
              <h2>Uncertainties</h2>
              <ul>
                {active.uncertainties.map((u) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
            </>
          )}

          <h2>Recommended verification steps</h2>
          <ol>
            {active.verificationSteps.map((step) => (
              <li key={step.id}>{step.label}</li>
            ))}
          </ol>

          <h2>Coordination checks</h2>
          <ol>
            {active.coordinationChecks.map((step) => (
              <li key={step.id}>{step.label}</li>
            ))}
          </ol>

          <p className="rp-print-footer">Generated {formatTimestamp(active.generatedAt)} — COSMIC SENTINEL AI demonstration build.</p>
        </div>
      )}
    </div>
  );
}
