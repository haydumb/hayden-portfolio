export type Theme = 'terminal' | 'matrix' | 'amber' | 'mono';
export const THEMES: Theme[] = ['terminal', 'matrix', 'amber', 'mono'];
export const THEME_KEY = 'site-theme';

export function getTheme(): Theme {
  if (typeof localStorage === 'undefined') return 'terminal';
  const t = localStorage.getItem(THEME_KEY) ?? '';
  return (THEMES as string[]).includes(t) ? (t as Theme) : 'terminal';
}

export function setTheme(theme: Theme): void {
  if (typeof localStorage !== 'undefined') localStorage.setItem(THEME_KEY, theme);
}

export function applyTheme(theme: Theme): void {
  setTheme(theme);
  if (typeof document === 'undefined') return;
  if (theme === 'terminal') {
    delete document.documentElement.dataset.theme;
  } else {
    document.documentElement.dataset.theme = theme;
  }
}
