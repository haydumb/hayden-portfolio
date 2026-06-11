export type HistoryDir = 'up' | 'down';

export interface HistoryState {
  index: number; // -1 = current empty line
  value: string;
}

/** Move through command history. `entries` is oldest-first. */
export function navigateHistory(
  entries: string[],
  currentIndex: number,
  dir: HistoryDir,
): HistoryState {
  if (entries.length === 0) return { index: -1, value: '' };

  if (dir === 'up') {
    const next = currentIndex === -1 ? entries.length - 1 : Math.max(0, currentIndex - 1);
    return { index: next, value: entries[next] };
  }

  if (currentIndex === -1) return { index: -1, value: '' };
  const next = currentIndex + 1;
  if (next >= entries.length) return { index: -1, value: '' };
  return { index: next, value: entries[next] };
}
