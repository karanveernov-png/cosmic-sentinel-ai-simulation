/**
 * The mock dataset expresses timestamps as relative offsets from "now"
 * (e.g. "T-9m" = 9 minutes ago) so a hackathon demo always looks current no
 * matter when it's actually run. This module resolves those markers to real
 * ISO timestamps at read time, and formats ISO timestamps for display.
 */

const RELATIVE_PATTERN = /^T-(\d+)(m|h)$/;

export function resolveRelativeTimestamp(marker: string, anchor: Date = new Date()): string {
  const match = RELATIVE_PATTERN.exec(marker);
  if (!match) {
    // Already a concrete ISO timestamp — pass through unchanged.
    return marker;
  }
  const amount = Number(match[1]);
  const unit = match[2];
  const ms = unit === 'h' ? amount * 60 * 60 * 1000 : amount * 60 * 1000;
  return new Date(anchor.getTime() - ms).toISOString();
}

export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const diffMs = now.getTime() - new Date(iso).getTime();
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin < 1) return 'just now';
  if (diffMin === 1) return '1 min ago';
  if (diffMin < 60) return `${diffMin} min ago`;

  const diffHr = Math.round(diffMin / 60);
  if (diffHr === 1) return '1 hr ago';
  if (diffHr < 24) return `${diffHr} hr ago`;

  const diffDay = Math.round(diffHr / 24);
  return diffDay === 1 ? '1 day ago' : `${diffDay} days ago`;
}

export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return (
    date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' local'
  );
}

export function formatClock(date: Date): string {
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function formatClockDate(date: Date): string {
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}
