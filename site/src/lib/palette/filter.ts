export interface FilterItem {
  id: string;
  label: string;
  keywords?: string;
}

function score(query: string, text: string): number {
  let qi = 0;
  let s = 0;
  let streak = 0;
  let firstIndex = -1;
  for (let ti = 0; ti < text.length && qi < query.length; ti++) {
    if (text[ti] === query[qi]) {
      if (firstIndex === -1) firstIndex = ti;
      streak += 1;
      s += 1 + streak;
      qi += 1;
    } else {
      streak = 0;
    }
  }
  if (qi < query.length) return -1;
  return s - firstIndex * 0.1;
}

export function fuzzyFilter<T extends FilterItem>(query: string, items: T[]): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items
    .map((item, i) => ({ item, i, score: score(q, `${item.label} ${item.keywords ?? ''}`.toLowerCase()) }))
    .filter((x) => x.score >= 0)
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .map((x) => x.item);
}
