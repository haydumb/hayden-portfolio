import { describe, it, expect } from 'vitest';
import { tokenize } from './tokenize';

describe('tokenize', () => {
  it('splits a simple command into tokens', () => {
    expect(tokenize('ls work')).toEqual(['ls', 'work']);
  });
  it('collapses extra whitespace', () => {
    expect(tokenize('  cat   work/mcp-mesh  ')).toEqual(['cat', 'work/mcp-mesh']);
  });
  it('returns an empty array for blank input', () => {
    expect(tokenize('   ')).toEqual([]);
  });
});
