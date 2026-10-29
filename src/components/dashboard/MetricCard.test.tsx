import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MetricCard } from './MetricCard';

describe('MetricCard', () => {
  it('renders the label and value', () => {
    render(<MetricCard label="Active Incidents" value={7} />);
    expect(screen.getByText('Active Incidents')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('calls onClick when clicked, and renders as a plain div when no onClick is given', () => {
    const onClick = vi.fn();
    const { rerender } = render(<MetricCard label="Critical" value={2} onClick={onClick} />);
    fireEvent.click(screen.getByText('Critical'));
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(<MetricCard label="Critical" value={2} />);
    expect(screen.getByText('Critical').closest('button')).toBeNull();
  });
});
