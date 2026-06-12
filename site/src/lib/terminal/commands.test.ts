import { describe, it, expect } from 'vitest';
import { commandRegistry, runCommand, commandList } from './commands';
import type { CommandContext } from './types';

const ctx: CommandContext = {
  history: ['whoami', 'skills'],
  work: [
    { slug: 'mcp-mesh', title: 'The MCP Mesh' },
    { slug: 'cicd-overhaul', title: 'CI/CD Overhaul' },
  ],
};

describe('command registry', () => {
  it('exposes the expected commands', () => {
    const names = commandList().map((c) => c.name).sort();
    expect(names).toEqual(
      ['cat','clear','contact','experience','help','history','ls','neofetch','open','resume','skills','sudo','theme','under-the-hood','whoami'].sort(),
    );
  });

  it('runs whoami and includes the name', () => {
    expect(runCommand('whoami').output.some((l) => l.text.includes('Hayden Remington'))).toBe(true);
  });

  it('help lists every command with a description', () => {
    const res = runCommand('help');
    for (const cmd of commandList()) {
      expect(res.output.some((l) => l.text.includes(cmd.name))).toBe(true);
    }
  });

  it('ls work lists projects from context', () => {
    const res = runCommand('ls work', ctx);
    expect(res.output.some((l) => l.text.includes('mcp-mesh'))).toBe(true);
    expect(res.output.some((l) => l.text.includes('cicd-overhaul'))).toBe(true);
  });

  it('cat work/mcp-mesh returns a navigate action', () => {
    expect(runCommand('cat work/mcp-mesh', ctx).action).toEqual({ type: 'navigate', target: '/work/mcp-mesh' });
  });

  it('cat with no argument shows usage', () => {
    const res = runCommand('cat');
    expect(res.output[0].tone).toBe('error');
    expect(res.output[0].text).toContain('Usage');
  });

  it('open <slug> navigates to the case study', () => {
    expect(runCommand('open cicd-overhaul', ctx).action).toEqual({ type: 'navigate', target: '/work/cicd-overhaul' });
  });

  it('resume returns a download action', () => {
    expect(runCommand('resume').action?.type).toBe('download');
  });

  it('clear returns a clear action', () => {
    expect(runCommand('clear').action).toEqual({ type: 'clear' });
  });

  it('neofetch includes the name', () => {
    expect(runCommand('neofetch').output.some((l) => l.text.includes('Hayden Remington'))).toBe(true);
  });

  it('history lists prior commands from context', () => {
    const res = runCommand('history', ctx);
    expect(res.output.some((l) => l.text.includes('whoami'))).toBe(true);
    expect(res.output.some((l) => l.text.includes('skills'))).toBe(true);
  });

  it('history with empty context shows a placeholder', () => {
    expect(runCommand('history').output[0].text).toContain('no history');
  });

  it('theme matrix returns a theme action', () => {
    expect(runCommand('theme matrix').action).toEqual({ type: 'theme', target: 'matrix' });
  });

  it('theme with no or invalid arg shows usage', () => {
    expect(runCommand('theme').output[0].text).toContain('usage');
    expect(runCommand('theme rainbow').output[0].text).toContain('usage');
  });

  it('sudo hire-me navigates to contact', () => {
    expect(runCommand('sudo hire-me').action).toEqual({ type: 'navigate', target: '/#contact' });
  });

  it('sudo without hire-me is denied', () => {
    expect(runCommand('sudo rm').output[0].text).toContain('permission denied');
  });

  it('unknown command returns an error line', () => {
    const res = runCommand('frobnicate');
    expect(res.output[0].tone).toBe('error');
    expect(res.output[0].text).toContain('frobnicate');
  });

  it('blank input returns no output', () => {
    expect(runCommand('   ').output).toEqual([]);
  });

  it('commandRegistry is keyed by command name', () => {
    expect(commandRegistry['whoami'].name).toBe('whoami');
    expect(commandRegistry['under-the-hood'].name).toBe('under-the-hood');
  });
});
