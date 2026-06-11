import { describe, it, expect } from 'vitest';
import { navigateHistory } from './history';

const entries = ['whoami', 'skills', 'ls work'];

describe('navigateHistory', () => {
  it('up from the empty line selects the most recent entry', () => {
    expect(navigateHistory(entries, -1, 'up')).toEqual({ index: 2, value: 'ls work' });
  });
  it('up again moves to older entries', () => {
    expect(navigateHistory(entries, 2, 'up')).toEqual({ index: 1, value: 'skills' });
  });
  it('stops at the oldest entry', () => {
    expect(navigateHistory(entries, 0, 'up')).toEqual({ index: 0, value: 'whoami' });
  });
  it('down returns toward the empty line', () => {
    expect(navigateHistory(entries, 1, 'down')).toEqual({ index: 2, value: 'ls work' });
  });
  it('down past the newest returns to the empty line', () => {
    expect(navigateHistory(entries, 2, 'down')).toEqual({ index: -1, value: '' });
  });
  it('handles empty history', () => {
    expect(navigateHistory([], -1, 'up')).toEqual({ index: -1, value: '' });
  });
});
