import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CommandPalette, { type PaletteItem } from './CommandPalette';

const items: PaletteItem[] = [
  { id: 'home', label: 'Home', kind: 'link', href: '/' },
  { id: 'work', label: 'Work', kind: 'link', href: '/work' },
  { id: 'theme-matrix', label: 'Theme: Matrix', keywords: 'color', kind: 'theme', theme: 'matrix' },
];

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
});

describe('CommandPalette', () => {
  it('is hidden until the keyboard shortcut opens it', async () => {
    const user = userEvent.setup();
    render(<CommandPalette items={items} />);
    expect(screen.queryByRole('dialog')).toBeNull();
    await user.keyboard('{Control>}k{/Control}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('filters results as you type', async () => {
    const user = userEvent.setup();
    render(<CommandPalette items={items} />);
    await user.keyboard('{Control>}k{/Control}');
    await user.keyboard('work');
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.queryByText('Home')).toBeNull();
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    render(<CommandPalette items={items} />);
    await user.keyboard('{Control>}k{/Control}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('applies a theme when a theme item is selected', async () => {
    const user = userEvent.setup();
    render(<CommandPalette items={items} />);
    await user.keyboard('{Control>}k{/Control}');
    await user.keyboard('matrix');
    await user.keyboard('{Enter}');
    expect(document.documentElement.dataset.theme).toBe('matrix');
  });
});
