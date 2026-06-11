const ITEMS = [
  { label: 'About', href: '/#about' },
  { label: 'Work', href: '/work' },
  { label: 'Under the Hood', href: '/under-the-hood' },
  { label: 'Contact', href: '/#contact' },
];

export default function GuiMenu() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" role="navigation" aria-label="Site sections">
      {ITEMS.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className="rounded-lg border border-[var(--color-green)]/30 bg-[var(--color-surface)] px-4 py-3 text-center text-sm text-[var(--color-text)] transition hover:border-[var(--color-green)]"
        >
          {item.label}
        </a>
      ))}
    </div>
  );
}
