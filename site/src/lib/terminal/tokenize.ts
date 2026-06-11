/** Split a raw terminal input string into trimmed, whitespace-collapsed tokens. */
export function tokenize(input: string): string[] {
  return input.trim().split(/\s+/).filter(Boolean);
}
