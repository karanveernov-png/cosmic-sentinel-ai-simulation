import type { ReactNode } from 'react';
import './MetricCard.css';

interface MetricCardProps {
  label: string;
  value: ReactNode;
  tone?: 'critical' | 'high' | 'medium' | 'low' | 'neutral';
  detail?: string;
  onClick?: () => void;
}

export function MetricCard({ label, value, tone = 'neutral', detail, onClick }: MetricCardProps) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag className={`metric-card metric-card--${tone}${onClick ? ' metric-card--clickable' : ''}`} onClick={onClick}>
      <div className="metric-card-label">{label}</div>
      <div className="metric-card-value">{value}</div>
      {detail && <div className="metric-card-detail">{detail}</div>}
    </Tag>
  );
}
