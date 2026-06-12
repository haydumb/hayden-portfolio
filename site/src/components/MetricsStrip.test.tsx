import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MetricsStrip from './MetricsStrip';
import { metrics } from '../data/metrics';
import { formatMetric } from '../lib/metrics';

describe('MetricsStrip', () => {
  it('renders the final value and label for each metric', () => {
    render(<MetricsStrip />);
    for (const m of metrics) {
      expect(screen.getByText(formatMetric(m))).toBeInTheDocument();
      expect(screen.getByText(m.label)).toBeInTheDocument();
    }
  });
});
