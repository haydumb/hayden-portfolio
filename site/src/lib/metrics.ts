import type { Metric } from '../data/metrics';

export function formatMetric(m: Metric, current?: number): string {
  const n = current ?? m.value;
  return `${m.prefix ?? ''}${n}${m.suffix ?? ''}`;
}

export function countValue(target: number, progress: number): number {
  const p = Math.min(1, Math.max(0, progress));
  const eased = 1 - Math.pow(1 - p, 3);
  return Math.round(target * eased);
}
