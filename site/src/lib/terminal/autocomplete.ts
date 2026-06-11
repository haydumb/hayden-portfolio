/** Return candidates that start with `partial`, sorted alphabetically. */
export function complete(partial: string, candidates: string[]): string[] {
  return candidates.filter((c) => c.startsWith(partial)).sort();
}
