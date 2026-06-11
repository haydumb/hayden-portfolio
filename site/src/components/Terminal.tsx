import { useEffect, useRef, useState } from 'react';
import { runCommand, commandList } from '../lib/terminal/commands';
import { complete } from '../lib/terminal/autocomplete';
import { navigateHistory } from '../lib/terminal/history';
import type { OutputLine } from '../lib/terminal/types';
import { getMode, setMode, type NavMode } from '../lib/mode';
import GuiMenu from './GuiMenu';
import CommandsHelp from './CommandsHelp';

interface Block {
  input: string;
  output: OutputLine[];
}

const toneClass: Record<NonNullable<OutputLine['tone']>, string> = {
  default: 'text-[var(--color-text)]',
  muted: 'text-[var(--color-muted)]',
  green: 'text-[var(--color-green)]',
  amber: 'text-[var(--color-amber)]',
  error: 'text-red-400',
};

export default function Terminal() {
  const [mode, setModeState] = useState<NavMode>('terminal');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [value, setValue] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [histIndex, setHistIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => setModeState(getMode()), []);
  useEffect(() => endRef.current?.scrollIntoView?.({ block: 'end' }), [blocks]);

  function execute(raw: string) {
    const result = runCommand(raw);
    if (result.action?.type === 'clear') {
      setBlocks([]);
    } else if (result.action?.type === 'navigate' && result.action.target) {
      window.location.assign(result.action.target);
      return;
    } else if (result.action?.type === 'download' && result.action.target) {
      const a = document.createElement('a');
      a.href = result.action.target;
      a.download = '';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    if (result.action?.type !== 'clear') {
      setBlocks((b) => [...b, { input: raw, output: result.output }]);
    }
    if (raw.trim()) setHistory((h) => [...h, raw.trim()]);
    setHistIndex(-1);
    setValue('');
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      execute(value);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const matches = complete(value.trim(), commandList().map((c) => c.name));
      if (matches.length === 1) setValue(matches[0]);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = navigateHistory(history, histIndex, e.key === 'ArrowUp' ? 'up' : 'down');
      setHistIndex(next.index);
      setValue(next.value);
    }
  }

  function switchMode(next: NavMode) {
    setMode(next);
    setModeState(next);
  }

  if (mode === 'gui') {
    return (
      <div className="font-mono">
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={() => switchMode('terminal')}
            className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-text)]"
          >
            <span aria-hidden="true">⌨</span> Use the terminal
          </button>
        </div>
        <GuiMenu />
      </div>
    );
  }

  return (
    <div
      className="rounded-xl bg-[var(--color-bg)] p-4 font-mono text-sm shadow-lg ring-1 ring-[var(--color-border)]"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
          <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
          <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setShowHelp((s) => !s); }}
            className="rounded-md border border-[var(--color-green)] px-2.5 py-1 text-xs text-[var(--color-green)]"
            aria-expanded={showHelp}
            aria-controls="commands-help-panel"
          >
            ? Commands <span aria-hidden="true">▾</span>
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); switchMode('gui'); }}
            className="rounded-md border border-[var(--color-border)] px-2.5 py-1 text-xs text-[var(--color-muted)]"
          >
            <span aria-hidden="true">☰</span> Browse without terminal
          </button>
        </div>
      </div>

      {showHelp && (
        <div id="commands-help-panel" className="mb-3" onClick={(e) => e.stopPropagation()}>
          <CommandsHelp onRun={(name) => { setShowHelp(false); execute(name); }} />
        </div>
      )}

      {blocks.map((block, i) => (
        <div key={i} className="mb-2">
          <div>
            <span className="text-[var(--color-green)]">hayden@portfolio:~$</span> {block.input}
          </div>
          {block.output.map((l, j) => (
            <div key={j} className={toneClass[l.tone ?? 'default']}>{l.text}</div>
          ))}
        </div>
      ))}

      <div className="flex items-center gap-2">
        <span className="text-[var(--color-green)]">hayden@portfolio:~$</span>
        <input
          ref={inputRef}
          aria-label="terminal input"
          className="flex-1 bg-transparent outline-none"
          value={value}
          spellCheck={false}
          autoComplete="off"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
        />
      </div>
      <div className="mt-2 text-[11px] text-[var(--color-muted)]">
        New here? Type <span className="text-[var(--color-green)]">help</span> or click{' '}
        <span className="text-[var(--color-green)]">? Commands</span>.
      </div>
      <div ref={endRef} />
    </div>
  );
}
