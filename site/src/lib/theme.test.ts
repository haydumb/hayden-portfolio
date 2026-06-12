import { describe, it, expect, beforeEach } from 'vitest';
import { getTheme, setTheme, applyTheme, THEME_KEY, THEMES } from './theme';

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
});

describe('theme', () => {
  it('exposes the four themes', () => {
    expect(THEMES).toEqual(['terminal', 'matrix', 'amber', 'mono']);
  });
  it('defaults to terminal', () => {
    expect(getTheme()).toBe('terminal');
  });
  it('ignores an invalid stored value', () => {
    localStorage.setItem(THEME_KEY, 'rainbow');
    expect(getTheme()).toBe('terminal');
  });
  it('persists a set theme', () => {
    setTheme('amber');
    expect(localStorage.getItem(THEME_KEY)).toBe('amber');
    expect(getTheme()).toBe('amber');
  });
  it('applyTheme sets the data-theme attribute and persists', () => {
    applyTheme('matrix');
    expect(document.documentElement.dataset.theme).toBe('matrix');
    expect(getTheme()).toBe('matrix');
  });
  it('applyTheme terminal clears the data-theme attribute', () => {
    applyTheme('matrix');
    applyTheme('terminal');
    expect(document.documentElement.dataset.theme).toBeUndefined();
    expect(getTheme()).toBe('terminal');
  });
});
