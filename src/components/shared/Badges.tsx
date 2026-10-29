import type { IncidentPriority, VerificationState } from '../../types/incident';
import type { SourceDataStatus } from '../../types/source';
import { DATA_STATUS_LABELS, PRIORITY_LABELS, VERIFICATION_LABELS } from '../../utils/format';

const PRIORITY_CLASS: Record<IncidentPriority, string> = {
  critical: 'badge-critical',
  high: 'badge-high',
  medium: 'badge-medium',
  low: 'badge-low',
};

export function PriorityBadge({ priority }: { priority: IncidentPriority }) {
  return <span className={`badge ${PRIORITY_CLASS[priority]}`}>{PRIORITY_LABELS[priority]}</span>;
}

const VERIFICATION_CLASS: Record<VerificationState, string> = {
  verified: 'badge-low',
  unverified: 'badge-high',
  simulated: 'badge-violet',
};

export function VerificationBadge({ state }: { state: VerificationState }) {
  return <span className={`badge ${VERIFICATION_CLASS[state]}`}>{VERIFICATION_LABELS[state]}</span>;
}

const STATUS_CLASS: Record<SourceDataStatus, string> = {
  live: 'badge-low',
  demo: 'badge-violet',
  partial: 'badge-high',
  unavailable: 'badge-neutral',
};

export function DataStatusBadge({ status }: { status: SourceDataStatus }) {
  return <span className={`badge ${STATUS_CLASS[status]}`}>{DATA_STATUS_LABELS[status]}</span>;
}

export function CompoundBadge() {
  return (
    <span className="badge badge-critical" title="Flagged by the Compound Threat Intelligence Engine">
      Compound
    </span>
  );
}
