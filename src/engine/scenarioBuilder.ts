import type { Incident } from '../types/incident';
import type { IntelligenceScenario, ScenarioKind } from '../types/intelligence';
import { scoreCompoundPair } from './compoundThreatEngine';

interface ScenarioDefinition {
  id: string;
  kind: ScenarioKind;
  title: string;
  region: string;
  primaryId: string;
  secondaryId: string;
  relationshipSummary: string;
  potentialImplication: string;
  narrativeEvidence: string[];
  uncertainty: string[];
  recommendedVerification: string[];
}

/**
 * The three required demonstration scenarios. Each references real entries
 * in the mock dataset and is scored live through `scoreCompoundPair` — none
 * of the numbers below are hardcoded, only the narrative framing is.
 */
const SCENARIO_DEFINITIONS: ScenarioDefinition[] = [
  {
    id: 'scenario-a-related',
    kind: 'related',
    title: 'Flood Warning + Communication Outage',
    region: 'Region A — South Delta Basin',
    primaryId: 'EQ-2026-0001',
    secondaryId: 'COM-2026-0014',
    relationshipSummary: 'Geographic and temporal overlap between an active flood warning and a verified emergency-network outage.',
    potentialImplication:
      'If emergency communication services remain affected, coordinating an evacuation or relief response in the flood zone could become more difficult.',
    narrativeEvidence: [
      'Flood warning reported for Region A — South Delta Basin.',
      'Communication outage reported in the same region, affecting emergency-network relay stations.',
      'Both incidents overlap geographically.',
      'Both incidents fall within the configured analysis window.',
    ],
    uncertainty: [
      "The outage's impact on emergency services specifically has not been independently established.",
      'Root cause of the outage has not yet been confirmed.',
    ],
    recommendedVerification: [
      'Confirm whether emergency communication channels are among those affected.',
      'Verify availability of backup communication systems for the flood zone.',
      'Check for an updated flood-severity assessment from the hydrological authority.',
      'Escalate to a human coordinator if comms remain down beyond 15 minutes.',
    ],
  },
  {
    id: 'scenario-b-unrelated',
    kind: 'unrelated',
    title: 'Flood Warning (Region A) + Outage (Region B)',
    region: 'Region A / Region B — different regions',
    primaryId: 'EQ-2026-0001',
    secondaryId: 'COM-2026-0099',
    relationshipSummary: 'No geographic overlap — the flood warning and the communication outage affect different regions entirely.',
    potentialImplication:
      'None identified. The two reports are evaluated independently; the outage in Region B does not affect response prioritization for the Region A flood warning.',
    narrativeEvidence: [
      'Flood warning reported for Region A — South Delta Basin.',
      'Communication outage reported for Region B — Eastern Shoreline, a different region.',
      'No geographic overlap detected between the two reports.',
    ],
    uncertainty: [],
    recommendedVerification: [
      'Continue monitoring both incidents independently.',
      'Re-evaluate only if new reports establish an actual overlap.',
    ],
  },
  {
    id: 'scenario-c-uncertain',
    kind: 'uncertain',
    title: 'Flood Warning + Unverified Signal Report',
    region: 'Region A — South Delta Basin',
    primaryId: 'EQ-2026-0001',
    secondaryId: 'COM-2026-0031',
    relationshipSummary: 'Possible geographic overlap with a crowd-sourced, unverified signal-degradation report in the same region.',
    potentialImplication:
      'A relationship is plausible but not established. Priority is held back relative to Scenario A until the report is corroborated.',
    narrativeEvidence: [
      'Flood warning reported for Region A — South Delta Basin.',
      'An unverified, crowd-sourced signal-degradation report overlaps the same region.',
    ],
    uncertainty: [
      'The signal-degradation report has not been corroborated by the network operations center.',
      'Overlap is treated as a possible, not confirmed, relationship.',
    ],
    recommendedVerification: [
      'Request confirmation from the network operations center.',
      'Treat as a monitoring item rather than a confirmed compound threat until corroborated.',
    ],
  },
];

export function buildIntelligenceScenarios(incidents: Incident[]): IntelligenceScenario[] {
  const byId = new Map(incidents.map((incident) => [incident.id, incident]));

  return SCENARIO_DEFINITIONS.map((def) => {
    const primary = byId.get(def.primaryId);
    const secondary = byId.get(def.secondaryId);

    if (!primary || !secondary) {
      throw new Error(`Scenario "${def.id}" references an incident id not present in the dataset.`);
    }

    const score = scoreCompoundPair(primary, secondary);
    const ruleEvidence = score.rules.filter((r) => r.triggered).map((r) => r.explanation);

    return {
      id: def.id,
      kind: def.kind,
      title: def.title,
      region: def.region,
      incidentIds: [def.primaryId, def.secondaryId],
      relationshipSummary: def.relationshipSummary,
      potentialImplication: def.potentialImplication,
      evidence: [...def.narrativeEvidence, ...ruleEvidence],
      uncertainty: def.uncertainty,
      recommendedVerification: def.recommendedVerification,
      score,
    };
  });
}
