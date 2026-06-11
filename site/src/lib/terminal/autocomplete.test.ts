import { describe, it, expect } from 'vitest';
import { complete } from './autocomplete';

const candidates = ['help', 'whoami', 'work', 'skills', 'contact'];

describe('complete', () => {
  it('returns all candidates that start with the partial', () => {
    expect(complete('wh', candidates)).toEqual(['whoami']);
  });
  it('returns multiple matches sorted', () => {
    expect(complete('w', candidates)).toEqual(['whoami', 'work']);
  });
  it('returns [] when nothing matches', () => {
    expect(complete('zzz', candidates)).toEqual([]);
  });
  it('returns all candidates for an empty partial', () => {
    expect(complete('', candidates)).toEqual([...candidates].sort());
  });
});
