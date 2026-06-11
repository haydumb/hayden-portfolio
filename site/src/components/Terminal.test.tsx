import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Terminal from './Terminal';

beforeEach(() => localStorage.clear());

describe('Terminal', () => {
  it('runs a typed command and shows output', async () => {
    const user = userEvent.setup();
    render(<Terminal />);
    const input = screen.getByRole('textbox', { name: /terminal input/i });
    await user.type(input, 'whoami{enter}');
    expect(await screen.findByText(/Hayden Remington/)).toBeInTheDocument();
  });

  it('autocompletes on Tab', async () => {
    const user = userEvent.setup();
    render(<Terminal />);
    const input = screen.getByRole('textbox', { name: /terminal input/i }) as HTMLInputElement;
    await user.type(input, 'sk');
    await user.keyboard('{Tab}');
    expect(input.value).toBe('skills');
  });

  it('toggles to the GUI menu via Browse without terminal', async () => {
    const user = userEvent.setup();
    render(<Terminal />);
    await user.click(screen.getByRole('button', { name: /browse without terminal/i }));
    expect(screen.getByRole('navigation', { name: /site sections/i })).toBeInTheDocument();
  });

  it('runs a command when a cheat-sheet entry is clicked', async () => {
    const user = userEvent.setup();
    render(<Terminal />);
    await user.click(screen.getByRole('button', { name: /\? commands/i }));
    await user.click(screen.getByRole('button', { name: /whoami/i }));
    expect(await screen.findByText(/Hayden Remington/)).toBeInTheDocument();
  });
});
