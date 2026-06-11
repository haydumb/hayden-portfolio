import { describe, it, expect, beforeEach } from 'vitest';
import { getMode, setMode, MODE_KEY } from './mode';

beforeEach(() => localStorage.clear());

describe('nav mode', () => {
  it('defaults to terminal when nothing is stored', () => {
    expect(getMode()).toBe('terminal');
  });
  it('persists a set mode to localStorage', () => {
    setMode('gui');
    expect(localStorage.getItem(MODE_KEY)).toBe('gui');
    expect(getMode()).toBe('gui');
  });
  it('ignores invalid stored values and falls back to terminal', () => {
    localStorage.setItem(MODE_KEY, 'nonsense');
    expect(getMode()).toBe('terminal');
  });
});
