/**
 * Scoring configuration for the frontend demonstration of the Compound
 * Threat Intelligence Engine.
 *
 * This is a deterministic, rule-based, and fully transparent scoring model —
 * it is NOT a trained or validated predictive model, and the resulting
 * number is a prototype prioritization aid, not a scientific probability of
 * disaster. Every point added or withheld here must trace back to a named
 * rule so the UI can show its work.
 *
 * When the FastAPI backend becomes the source of truth, it can return a
 * `ScoreBreakdown` in the same shape and the UI will render it exactly the
 * same way without using this module at all — see
 * `providers/httpDataProvider.ts`.
 */

export const SCORE_BOUNDS = {
  min: 0,
  max: 100,
} as const;

/**
 * Point value awarded for each rule, when triggered. Every rule below
 * `geographicOverlap` only ever fires once geography has already overlapped
 * — see compoundThreatEngine.ts — so an unrelated-region pair can only ever
 * be penalized relative to its base severity, never boosted above it.
 *
 * Weights are kept deliberately modest relative to the [0, 100] bound: the
 * full positive stack (geo + temporal + critical-service + independent
 * sources = 36) plus a mid-severity base leaves headroom below the ceiling,
 * so the "uncertain" demonstration scenario's penalties remain visible in
 * the final score instead of being washed out by clamping.
 */
export const RULE_WEIGHTS = {
  geographicOverlap: 14,
  temporalOverlap: 8,
  criticalServiceInvolved: 10,
  multipleIndependentSources: 4,
  lowDataQuality: -12, // penalty — low confidence pulls priority down
  unverifiedEvidence: -14, // penalty — treat unverified evidence conservatively
  simulatedOnly: -8, // penalty — simulated-only pairs stay capped below real incidents
} as const;

/** Minimum fraction of overlapping geography (0–1) to count as "overlapping". */
export const GEOGRAPHIC_OVERLAP_THRESHOLD = 0.5;

/** Maximum gap between two incidents' timestamps, in minutes, to count as "temporally relevant". */
export const TEMPORAL_RELEVANCE_WINDOW_MINUTES = 90;

export const PRIORITY_THRESHOLDS = {
  critical: 75,
  high: 55,
  medium: 30,
  // anything below `medium` is `low`
} as const;
