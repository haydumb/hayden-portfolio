import { commandList } from '../lib/terminal/commands';

export default function CommandsHelp({ onRun }: { onRun: (name: string) => void }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <p className="mb-2 text-[10px] uppercase tracking-widest text-[var(--color-green)]">
        Available commands. Click any to run it
      </p>
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {commandList().map((c) => (
          <button
            key={c.name}
            type="button"
            onClick={() => onRun(c.name)}
            className="text-left text-xs hover:underline"
          >
            <span className="text-[var(--color-amber)]">{c.name}</span>{' '}
            <span className="text-[var(--color-muted)]">· {c.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
