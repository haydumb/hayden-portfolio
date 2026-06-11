export type NavMode = 'terminal' | 'gui';
export const MODE_KEY = 'nav-mode';

export function getMode(): NavMode {
  if (typeof localStorage === 'undefined') return 'terminal';
  const stored = localStorage.getItem(MODE_KEY);
  return stored === 'gui' || stored === 'terminal' ? stored : 'terminal';
}

export function setMode(mode: NavMode): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(MODE_KEY, mode);
}
