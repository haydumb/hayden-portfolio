import { describe, it, expect } from 'vitest';
import { commandRegistry, runCommand, commandList } from './commands';

describe('command registry', () => {
  it('exposes the expected commands', () => {
    const names = commandList().map((c) => c.name).sort();
    expect(names).toEqual(
      ['cat', 'clear', 'contact', 'experience', 'help', 'ls', 'resume', 'skills', 'under-the-hood', 'whoami'].sort(),
    );
  });

  it('runs whoami and includes the name', () => {
    const res = runCommand('whoami');
    expect(res.output.some((l) => l.text.includes('Hayden Remington'))).toBe(true);
  });

  it('help lists every command with a description', () => {
    const res = runCommand('help');
    for (const cmd of commandList()) {
      expect(res.output.some((l) => l.text.includes(cmd.name))).toBe(true);
    }
  });

  it('ls work lists the mcp-mesh project', () => {
    const res = runCommand('ls work');
    expect(res.output.some((l) => l.text.includes('mcp-mesh'))).toBe(true);
  });

  it('cat work/mcp-mesh returns a navigate action', () => {
    const res = runCommand('cat work/mcp-mesh');
    expect(res.action).toEqual({ type: 'navigate', target: '/work/mcp-mesh' });
  });

  it('resume returns a download action', () => {
    const res = runCommand('resume');
    expect(res.action?.type).toBe('download');
  });

  it('clear returns a clear action', () => {
    expect(runCommand('clear').action).toEqual({ type: 'clear' });
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

  it('cat with no argument shows usage', () => {
    const res = runCommand('cat');
    expect(res.output[0].tone).toBe('error');
    expect(res.output[0].text).toContain('Usage');
  });
});
