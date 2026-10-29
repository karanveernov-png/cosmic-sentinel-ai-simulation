export interface ResponsePlan {
  id: string;
  scenarioId: string;
  title: string;
  region: string;
  priority: import('./incident').IncidentPriority;
  reasonForPriority: string;
  evidence: string[];
  uncertainties: string[];
  verificationSteps: ResponseAction[];
  coordinationChecks: ResponseAction[];
  summary: string;
  generatedAt: string;
}

export interface ResponseAction {
  id: string;
  label: string;
  urgency: 'immediate' | 'high' | 'routine';
  done: boolean;
}
