import { useEffect, useMemo, useRef, useState } from 'react';
import { fuzzyFilter, type FilterItem } from '../lib/palette/filter';
import { applyTheme, type Theme } from '../lib/theme';

export interface PaletteItem extends FilterItem {
  kind: 'link' | 'theme';
  href?: string;
  theme?: Theme;
  hint?: string;
}

export default function CommandPalette({ items }: { items: PaletteItem[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => fuzzyFilter(query, items), [query, items]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    }
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener('keydown', onKey);
    window.addEventListener('open-command-palette', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('open-command-palette', onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  function activate(item: PaletteItem | undefined) {
    if (!item) return;
    setOpen(false);
    if (item.kind === 'theme' && item.theme) {
      applyTheme(item.theme);
    } else if (item.kind === 'link' && item.href) {
      window.location.assign(item.href);
    }
  }

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(results.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      activate(results[active]);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-[15vh]"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="w-full max-w-lg overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] font-mono shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          autoFocus
          aria-label="Command palette search"
          className="w-full bg-transparent px-4 py-3 text-sm text-[var(--color-text)] outline-none"
          placeholder="Jump to… (type to filter)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onInputKey}
        />
        <ul className="max-h-72 overflow-y-auto border-t border-[var(--color-border)]">
          {results.length === 0 && (
            <li className="px-4 py-3 text-xs text-[var(--color-muted)]">No matches</li>
          )}
          {results.map((item, i) => (
            <li key={item.id}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => activate(item)}
                className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm ${
                  i === active
                    ? 'bg-[var(--color-green)]/15 text-[var(--color-text)]'
                    : 'text-[var(--color-muted)]'
                }`}
              >
                <span>{item.label}</span>
                {item.hint && <span className="text-[10px] text-[var(--color-muted)]">{item.hint}</span>}
              </button>
            </li>
          ))}
        </ul>
        <div className="border-t border-[var(--color-border)] px-4 py-2 text-[10px] text-[var(--color-muted)]">
          ↑↓ navigate · ↵ select · esc close
        </div>
      </div>
    </div>
  );
}
