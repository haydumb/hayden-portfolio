import { describe, it, expect } from 'vitest';
import { formatMetric, countValue } from './metrics';

describe('metrics helpers', () => {
  it('formats prefix and suffix', () => {
    expect(formatMetric({ value: 30, prefix: '−', suffix: '%', label: 'x' })).toBe('−30%');
  });
  it('formats with an interpolated current value', () => {
    expect(formatMetric({ value: 30, suffix: '%', label: 'x' }, 12)).toBe('12%');
  });
  it('countValue is 0 at progress 0 and target at progress 1', () => {
    expect(countValue(100, 0)).toBe(0);
    expect(countValue(100, 1)).toBe(100);
  });
  it('countValue clamps out-of-range progress', () => {
    expect(countValue(100, -1)).toBe(0);
    expect(countValue(100, 2)).toBe(100);
  });
  it('countValue is monotonic non-decreasing', () => {
    expect(countValue(100, 0.25)).toBeLessThanOrEqual(countValue(100, 0.75));
  });
});
