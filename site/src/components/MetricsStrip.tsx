import { useEffect, useRef, useState } from 'react';
import { metrics, type Metric } from '../data/metrics';
import { formatMetric, countValue } from '../lib/metrics';

export default function MetricsStrip() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {metrics.map((m) => (
        <MetricCard key={m.label} metric={m} />
      ))}
    </div>
  );
}

function MetricCard({ metric }: { metric: Metric }) {
  // Final value rendered by default so SSR, no-JS, and screen readers always see the real number.
  const [display, setDisplay] = useState(metric.value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const el = ref.current;
    if (reduce || !el || typeof IntersectionObserver === 'undefined') {
      setDisplay(metric.value);
      return;
    }
    let raf = 0;
    let started = false;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          started = true;
          obs.disconnect();
          const duration = 1200;
          const start = performance.now();
          const tick = (now: number) => {
            const p = (now - start) / duration;
            setDisplay(countValue(metric.value, p));
            if (p < 1) raf = requestAnimationFrame(tick);
            else setDisplay(metric.value);
          };
          raf = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [metric.value]);

  return (
    <div
      ref={ref}
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center"
    >
      <div className="font-mono text-3xl font-extrabold text-[var(--color-green)]">
        {formatMetric(metric, display)}
      </div>
      <div className="mt-1 text-xs text-[var(--color-muted)]">{metric.label}</div>
    </div>
  );
}
