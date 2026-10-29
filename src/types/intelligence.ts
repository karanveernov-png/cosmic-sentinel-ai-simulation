import type { Incident } from './incident';

/**
 * A single rule outcome from the compound-threat scoring engine. Every
 * adjustment the engine makes must be traceable back to one of these, so the
 * UI can always explain "why" a score is what it is.
 */
export interface ScoringRuleResult {
  ruleId: string;
  label: string;
  triggered: boolean;
  pointsApplied: number;
  explanation: string;
}

export interface ScoreBreakdown {
  baseScore: number;
  rules: ScoringRuleResult[];
  /** Sum of pointsApplied across triggered rules, pre-clamp. */
  totalAdjustment: number;
  /** Final score after clamping to [0, 100]. */
  finalScore: number;
  finalPriority: import('./incident').IncidentPriority;
}

export type ScenarioKind = 'related' | 'unrelated' | 'uncertain';

/**
 * A compound-threat scenario groups two or more incidents that the engine
 * has evaluated together. For the "unrelated" demonstration scenario the
 * group still exists so the UI can show the pair side-by-side and make the
 * point that no relationship was found.
 */
export interface IntelligenceScenario {
  id: string;
  kind: ScenarioKind;
  title: string;
  region: string;
  incidentIds: string[];
  relationshipSummary: string;
  potentialImplication: string;
  evidence: string[];
  uncertainty: string[];
  recommendedVerification: string[];
  score: ScoreBreakdown;
}

export interface CompoundThreatGroup {
  scenario: IntelligenceScenario;
  incidents: Incident[];
}
