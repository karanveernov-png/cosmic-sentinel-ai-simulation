import type { IntelligenceScenario } from '../types/intelligence';
import type { ResponseAction, ResponsePlan } from '../types/response';

function toActions(steps: string[], urgency: ResponseAction['urgency']): ResponseAction[] {
  return steps.map((label, index) => ({
    id: `${urgency}-${index}`,
    label,
    urgency,
    done: false,
  }));
}

export function buildResponsePlan(scenario: IntelligenceScenario, generatedAt: string): ResponsePlan {
  const urgency: ResponseAction['urgency'] =
    scenario.score.finalPriority === 'critical' ? 'immediate' : scenario.score.finalPriority === 'high' ? 'high' : 'routine';

  return {
    id: `plan-${scenario.id}`,
    scenarioId: scenario.id,
    title: scenario.title,
    region: scenario.region,
    priority: scenario.score.finalPriority,
    reasonForPriority: scenario.relationshipSummary,
    evidence: scenario.evidence,
    uncertainties: scenario.uncertainty,
    verificationSteps: toActions(scenario.recommendedVerification, urgency),
    coordinationChecks: toActions(
      [
        'Confirm the affected geographic scope with field or regional contacts.',
        'Check whether a human coordinator has acknowledged this scenario.',
        scenario.score.finalPriority === 'critical' || scenario.score.finalPriority === 'high'
          ? 'Escalate to a senior coordinator given the current priority level.'
          : 'Continue routine monitoring; no escalation required at this time.',
      ],
      'routine',
    ),
    summary: scenario.potentialImplication,
    generatedAt,
  };
}

export function buildResponsePlans(scenarios: IntelligenceScenario[], generatedAt: string): ResponsePlan[] {
  return scenarios
    .slice()
    .sort((a, b) => b.score.finalScore - a.score.finalScore)
    .map((scenario) => buildResponsePlan(scenario, generatedAt));
}
