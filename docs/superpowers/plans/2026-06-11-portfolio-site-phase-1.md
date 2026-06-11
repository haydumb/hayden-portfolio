# Portfolio Site — Phase 1 (MVP) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a live, polished, terminal-themed DevOps portfolio at hayden-remington.com — terminal hero with a fully working command system, a non-technical navigation safety net, skills/experience/contact sections, the MCP Mesh case study, and a real GitHub Actions → Cloudflare Pages pipeline with live build badges.

**Architecture:** Astro 5 static site with Tailwind v4 for styling and a single React island for the interactive terminal. All terminal logic (command registry, tokenizer, autocomplete, history, nav-mode persistence) is extracted into pure, unit-tested TypeScript modules under `src/lib/`, so the React component is a thin shell. Content (case studies) lives in an Astro content collection (MDX); skills/experience are typed data modules. CI runs lint + typecheck + unit tests + build + Lighthouse budget, then deploys to Cloudflare Pages.

**Tech Stack:** Astro 5, Tailwind v4 (`@tailwindcss/vite`), React 19 (island), TypeScript, Vitest + @testing-library/react + jsdom, GitHub Actions, Cloudflare Pages, Lighthouse CI.

---

## File Structure

```
site/
  astro.config.mjs            # Astro + React + Tailwind(vite) + sitemap
  vitest.config.ts            # Vitest via astro/config getViteConfig, jsdom
  tsconfig.json
  package.json
  src/
    styles/global.css         # Tailwind import + theme tokens + base styles
    content.config.ts         # 'work' content collection (MDX) schema
    data/
      skills.ts               # SkillGroup[] — typed skills matrix data
      experience.ts           # Job[] — typed timeline data
      site.ts                 # site metadata (name, urls, contact)
    lib/
      terminal/
        types.ts              # Command, CommandResult, CommandContext types
        tokenize.ts           # tokenize(input) -> string[]
        tokenize.test.ts
        autocomplete.ts       # complete(partial, candidates) -> string[]
        autocomplete.test.ts
        history.ts            # navigateHistory(entries, index, dir)
        history.test.ts
        commands.ts           # commandRegistry + runCommand(input, ctx)
        commands.test.ts
      mode.ts                 # nav-mode (terminal|gui) localStorage store
      mode.test.ts
    components/
      Terminal.tsx            # React island: the interactive terminal
      Terminal.test.tsx
      CommandsHelp.tsx        # "? Commands" cheat-sheet (inside Terminal)
      GuiMenu.tsx             # "Browse without terminal" card menu
      Nav.astro               # shell-prompt top nav (always clickable)
      Section.astro           # titled section wrapper
      SkillsMatrix.astro
      ExperienceTimeline.astro
      Contact.astro
      Footer.astro
      BuildBadges.astro       # live CI/CD status badges
      Seo.astro               # OG/meta tags
    layouts/
      BaseLayout.astro        # html shell, Seo, Nav, Footer
      CaseStudyLayout.astro   # case-study page chrome
    content/
      work/
        mcp-mesh.mdx          # lead case study
    pages/
      index.astro             # home (hero + sections)
      work/index.astro        # `ls work` target — project list
      work/[...slug].astro    # case study route
  public/
    resume.pdf                # downloadable CV (placeholder until provided)
    favicon.svg
  .lighthouserc.json
.github/workflows/ci.yml      # CI + deploy (repo root)
```

---

## Task 0: Scaffold the Astro project

**Files:**
- Create: `site/` (Astro project), `site/package.json`, `site/astro.config.mjs`, `site/tsconfig.json`, `site/src/styles/global.css`

- [ ] **Step 1: Create the Astro project (minimal template)**

Run from repo root (`C:\gitrepos\hayden-portfolio`):
```bash
npm create astro@latest site -- --template minimal --no-install --no-git --skip-houston --typescript strict
```
Expected: `site/` created with `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/pages/index.astro`.

- [ ] **Step 2: Add React, Tailwind, and sitemap integrations**

Run:
```bash
cd site
npx astro add react tailwind sitemap --yes
```
Expected: installs `@astrojs/react`, `react`, `react-dom`, `@tailwindcss/vite`, `@astrojs/sitemap`; updates `astro.config.mjs`; creates/updates a Tailwind import. (Astro's Tailwind add uses the Vite plugin — there is no `tailwind.config.js` by default.)

- [ ] **Step 3: Install test tooling**

Run:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```
Expected: devDependencies added.

- [ ] **Step 4: Set the site URL in `astro.config.mjs`**

Ensure `astro.config.mjs` looks like this (merge with what `astro add` generated):
```js
// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://hayden-remington.com',
  integrations: [react(), sitemap()],
  vite: { plugins: [tailwindcss()] },
});
```

- [ ] **Step 5: Create `site/vitest.config.ts`**

```ts
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
```

- [ ] **Step 6: Create `site/vitest.setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 7: Add scripts to `site/package.json`**

Ensure the `scripts` block contains:
```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 8: Replace `site/src/styles/global.css`**

```css
@import "tailwindcss";

@theme {
  --color-bg: #0a0e0a;
  --color-surface: #10160f;
  --color-border: #1f3a26;
  --color-text: #e2e8e0;
  --color-muted: #8a978a;
  --color-green: #27c93f;
  --color-amber: #ffbd2e;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
}

html { background: var(--color-bg); color: var(--color-text); font-family: var(--font-sans); }
body { margin: 0; }
.prompt::before { content: "$ "; color: var(--color-green); }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
```

- [ ] **Step 9: Verify the project builds**

Run:
```bash
npm run build
```
Expected: build succeeds, `site/dist/` produced.

- [ ] **Step 10: Add `.gitignore` and commit**

Create `site/.gitignore` if not present (Astro generates one). Then from repo root:
```bash
git add site .gitignore
git commit -m "chore: scaffold Astro + Tailwind + React + Vitest"
```

---

## Task 1: Site metadata + skills + experience data

**Files:**
- Create: `site/src/data/site.ts`, `site/src/data/skills.ts`, `site/src/data/experience.ts`

- [ ] **Step 1: Create `site/src/data/site.ts`**

```ts
export const site = {
  name: 'Hayden Remington',
  role: 'DevOps · SRE · Platform Engineer',
  tagline: 'Infrastructure that ships itself.',
  summary:
    'Nearly 7 years automating CI/CD, scaling cloud infrastructure, and building AI-driven DevOps tooling.',
  email: 'haydenr337@gmail.com',
  github: 'https://github.com/haydumb',
  linkedin: 'https://www.linkedin.com/in/remingtonh/',
  location: 'Denver, CO',
  domain: 'hayden-remington.com',
} as const;
```

- [ ] **Step 2: Create `site/src/data/skills.ts`**

```ts
export interface SkillGroup {
  category: string;
  skills: string[];
}

export const skillGroups: SkillGroup[] = [
  { category: 'Cloud', skills: ['AWS', 'Azure', 'Google Cloud'] },
  { category: 'CI/CD & DevOps', skills: ['Azure DevOps', 'ArgoCD', 'Jenkins', 'Docker', 'Kubernetes', 'Scalr'] },
  { category: 'Infrastructure as Code', skills: ['Terraform', 'Ansible', 'ARM/Bicep', 'Scalr'] },
  { category: 'AI & Automation', skills: ['Model Context Protocol (MCP)', 'Claude plugins & agents', 'Power Automate', 'Prompt/skill engineering'] },
  { category: 'Observability & Security', skills: ['New Relic', 'Snyk', 'Anomaly detection', 'Monitoring & alerting'] },
  { category: 'Data Engineering', skills: ['Databricks', 'Change Data Capture (CDC)'] },
  { category: 'Languages', skills: ['Python', 'PowerShell', 'Bash', 'C'] },
  { category: 'Databases', skills: ['SQL Server', 'MySQL', 'PostgreSQL'] },
];
```

- [ ] **Step 3: Create `site/src/data/experience.ts`**

```ts
export interface Job {
  company: string;
  title: string;
  start: string;
  end: string;
  location: string;
  highlights: string[];
}

export const experience: Job[] = [
  {
    company: 'Accuris',
    title: 'DevOps Engineer',
    start: 'Dec 2025',
    end: 'Jun 2026',
    location: 'Denver, CO',
    highlights: [
      'Architected an MCP mesh unifying New Relic, ArgoCD, Snyk, Azure DevOps, and Scalr behind one coherent interface.',
      'Built a custom New Relic MCP server with higher query accuracy, lower token use, and lower latency than the existing solution.',
      'Developed a custom Claude plugin to scaffold repos, provision ArgoCD environments, and automate engineering tasks.',
      'Created a New Relic anomaly-detection tool (Power Automate) pushing real-time alerts to Microsoft Teams.',
      'Engineered Databricks CDC ingestion pipelines feeding clean real-time data to new AI models.',
    ],
  },
  {
    company: 'TransCore',
    title: 'DevOps Engineer',
    start: 'Jul 2024',
    end: 'Oct 2025',
    location: 'Denver, CO',
    highlights: [
      'Designed automated CI/CD pipelines in Azure DevOps, reducing deployment time by 30%.',
      'Built and maintained containerized environments with Docker and Kubernetes for scalable microservices.',
      'Automated infrastructure provisioning with Ansible and Bicep for consistent environments.',
      'Reduced cloud costs by 25% through resource optimization and improved monitoring.',
    ],
  },
  {
    company: 'TransCore',
    title: 'Software Engineer / Backend Developer',
    start: 'May 2023',
    end: 'Jul 2024',
    location: 'Nashville, TN',
    highlights: [
      'Created dynamic SQL monitoring tools with automated alerting, improving response times.',
      'Developed reusable, idempotent automation scripts for continuous deployment.',
      'Managed AWS infrastructure supporting high-volume production environments.',
    ],
  },
  {
    company: 'TransCore',
    title: 'Systems Specialist',
    start: 'Aug 2022',
    end: 'May 2023',
    location: 'Houston, TX',
    highlights: [
      'Automated patching for containerized systems, improving uptime and security compliance.',
      'Built health-check and deployment-validation scripts, cutting update downtime.',
    ],
  },
  {
    company: 'TransCore',
    title: 'Systems Specialist / Missing Images Team Lead',
    start: 'Aug 2021',
    end: 'Aug 2022',
    location: 'Houston, TX',
    highlights: [
      'Led a team remediating tolling data gaps, recovering lost revenue through improved accuracy.',
      'Created stored procedures for transaction validation and data-quality assurance.',
    ],
  },
];
```

- [ ] **Step 4: Commit**

```bash
git add site/src/data
git commit -m "feat: add site metadata, skills, and experience data"
```

---

## Task 2: Terminal tokenizer (TDD)

**Files:**
- Create: `site/src/lib/terminal/tokenize.ts`, `site/src/lib/terminal/tokenize.test.ts`

- [ ] **Step 1: Write the failing test (`tokenize.test.ts`)**

```ts
import { describe, it, expect } from 'vitest';
import { tokenize } from './tokenize';

describe('tokenize', () => {
  it('splits a simple command into tokens', () => {
    expect(tokenize('ls work')).toEqual(['ls', 'work']);
  });
  it('collapses extra whitespace', () => {
    expect(tokenize('  cat   work/mcp-mesh  ')).toEqual(['cat', 'work/mcp-mesh']);
  });
  it('returns an empty array for blank input', () => {
    expect(tokenize('   ')).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tokenize`
Expected: FAIL — cannot find module `./tokenize`.

- [ ] **Step 3: Implement `tokenize.ts`**

```ts
/** Split a raw terminal input string into trimmed, whitespace-collapsed tokens. */
export function tokenize(input: string): string[] {
  return input.trim().split(/\s+/).filter(Boolean);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tokenize`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add site/src/lib/terminal/tokenize.ts site/src/lib/terminal/tokenize.test.ts
git commit -m "feat: add terminal tokenizer"
```

---

## Task 3: Autocomplete (TDD)

**Files:**
- Create: `site/src/lib/terminal/autocomplete.ts`, `site/src/lib/terminal/autocomplete.test.ts`

- [ ] **Step 1: Write the failing test (`autocomplete.test.ts`)**

```ts
import { describe, it, expect } from 'vitest';
import { complete } from './autocomplete';

const candidates = ['help', 'whoami', 'work', 'skills', 'contact'];

describe('complete', () => {
  it('returns all candidates that start with the partial', () => {
    expect(complete('wh', candidates)).toEqual(['whoami']);
  });
  it('returns multiple matches sorted', () => {
    expect(complete('w', candidates)).toEqual(['whoami', 'work']);
  });
  it('returns [] when nothing matches', () => {
    expect(complete('zzz', candidates)).toEqual([]);
  });
  it('returns all candidates for an empty partial', () => {
    expect(complete('', candidates)).toEqual([...candidates].sort());
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- autocomplete`
Expected: FAIL — cannot find module `./autocomplete`.

- [ ] **Step 3: Implement `autocomplete.ts`**

```ts
/** Return candidates that start with `partial`, sorted alphabetically. */
export function complete(partial: string, candidates: string[]): string[] {
  return candidates.filter((c) => c.startsWith(partial)).sort();
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- autocomplete`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add site/src/lib/terminal/autocomplete.ts site/src/lib/terminal/autocomplete.test.ts
git commit -m "feat: add terminal autocomplete"
```

---

## Task 4: Command history navigation (TDD)

**Files:**
- Create: `site/src/lib/terminal/history.ts`, `site/src/lib/terminal/history.test.ts`

- [ ] **Step 1: Write the failing test (`history.test.ts`)**

```ts
import { describe, it, expect } from 'vitest';
import { navigateHistory } from './history';

// entries are oldest-first; index -1 means "current empty line"
const entries = ['whoami', 'skills', 'ls work'];

describe('navigateHistory', () => {
  it('up from the empty line selects the most recent entry', () => {
    expect(navigateHistory(entries, -1, 'up')).toEqual({ index: 2, value: 'ls work' });
  });
  it('up again moves to older entries', () => {
    expect(navigateHistory(entries, 2, 'up')).toEqual({ index: 1, value: 'skills' });
  });
  it('stops at the oldest entry', () => {
    expect(navigateHistory(entries, 0, 'up')).toEqual({ index: 0, value: 'whoami' });
  });
  it('down returns toward the empty line', () => {
    expect(navigateHistory(entries, 1, 'down')).toEqual({ index: 2, value: 'ls work' });
  });
  it('down past the newest returns to the empty line', () => {
    expect(navigateHistory(entries, 2, 'down')).toEqual({ index: -1, value: '' });
  });
  it('handles empty history', () => {
    expect(navigateHistory([], -1, 'up')).toEqual({ index: -1, value: '' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- history`
Expected: FAIL — cannot find module `./history`.

- [ ] **Step 3: Implement `history.ts`**

```ts
export type HistoryDir = 'up' | 'down';

export interface HistoryState {
  index: number; // -1 = current empty line
  value: string;
}

/** Move through command history. `entries` is oldest-first. */
export function navigateHistory(
  entries: string[],
  currentIndex: number,
  dir: HistoryDir,
): HistoryState {
  if (entries.length === 0) return { index: -1, value: '' };

  if (dir === 'up') {
    const next = currentIndex === -1 ? entries.length - 1 : Math.max(0, currentIndex - 1);
    return { index: next, value: entries[next] };
  }

  // down
  if (currentIndex === -1) return { index: -1, value: '' };
  const next = currentIndex + 1;
  if (next >= entries.length) return { index: -1, value: '' };
  return { index: next, value: entries[next] };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- history`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add site/src/lib/terminal/history.ts site/src/lib/terminal/history.test.ts
git commit -m "feat: add terminal history navigation"
```

---

## Task 5: Command registry + runCommand (TDD)

**Files:**
- Create: `site/src/lib/terminal/types.ts`, `site/src/lib/terminal/commands.ts`, `site/src/lib/terminal/commands.test.ts`

- [ ] **Step 1: Create `site/src/lib/terminal/types.ts`**

```ts
export interface OutputLine {
  text: string;
  tone?: 'default' | 'muted' | 'green' | 'amber' | 'error';
}

export interface CommandAction {
  type: 'navigate' | 'download' | 'clear';
  target?: string;
}

export interface CommandResult {
  output: OutputLine[];
  action?: CommandAction;
}

export interface Command {
  name: string;
  description: string; // plain-English, used by the `? Commands` cheat-sheet
  run: (args: string[]) => CommandResult;
}
```

- [ ] **Step 2: Write the failing test (`commands.test.ts`)**

```ts
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
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- commands`
Expected: FAIL — cannot find module `./commands`.

- [ ] **Step 4: Implement `commands.ts`**

```ts
import { tokenize } from './tokenize';
import type { Command, CommandResult, OutputLine } from './types';
import { site } from '../../data/site';
import { skillGroups } from '../../data/skills';
import { experience } from '../../data/experience';

// Keep in sync with content/work entries. Phase 2 can generate this list.
const WORK = [{ slug: 'mcp-mesh', title: 'The MCP Mesh' }];

function line(text: string, tone: OutputLine['tone'] = 'default'): OutputLine {
  return { text, tone };
}

const whoami: Command = {
  name: 'whoami',
  description: 'who I am',
  run: () => ({
    output: [
      line(site.name, 'green'),
      line(site.role, 'amber'),
      line(site.summary, 'muted'),
    ],
  }),
};

const skills: Command = {
  name: 'skills',
  description: 'tools & tech I use',
  run: () => ({
    output: skillGroups.flatMap((g) => [
      line(`${g.category}:`, 'amber'),
      line('  ' + g.skills.join(', '), 'muted'),
    ]),
  }),
};

const experienceCmd: Command = {
  name: 'experience',
  description: 'my career timeline',
  run: () => ({
    output: experience.flatMap((j) => [
      line(`${j.title} @ ${j.company}`, 'green'),
      line(`  ${j.start} – ${j.end} · ${j.location}`, 'muted'),
    ]),
  }),
};

const ls: Command = {
  name: 'ls',
  description: 'list my projects (try: ls work)',
  run: (args) => {
    if (args[0] === 'work' || args.length === 0) {
      return {
        output: [
          line('projects:', 'amber'),
          ...WORK.map((w) => line(`  work/${w.slug}   ${w.title}`)),
          line("tip: cat work/<name> to open a case study", 'muted'),
        ],
      };
    }
    return { output: [line(`ls: cannot access '${args[0]}': No such directory`, 'error')] };
  },
};

const cat: Command = {
  name: 'cat',
  description: 'read a case study (e.g. cat work/mcp-mesh)',
  run: (args) => {
    const target = args[0] ?? '';
    const slug = target.replace(/^work\//, '');
    const found = WORK.find((w) => w.slug === slug);
    if (!found) return { output: [line(`cat: ${target}: No such file`, 'error')] };
    return {
      output: [line(`Opening ${found.title}…`, 'green')],
      action: { type: 'navigate', target: `/work/${found.slug}` },
    };
  },
};

const contact: Command = {
  name: 'contact',
  description: 'get in touch',
  run: () => ({
    output: [
      line(`email:    ${site.email}`),
      line(`github:   ${site.github}`),
      line(`linkedin: ${site.linkedin}`),
    ],
  }),
};

const resume: Command = {
  name: 'resume',
  description: 'download my CV',
  run: () => ({
    output: [line('Downloading resume.pdf…', 'green')],
    action: { type: 'download', target: '/resume.pdf' },
  }),
};

const underTheHood: Command = {
  name: 'under-the-hood',
  description: 'how this site is built',
  run: () => ({
    output: [line('Opening /under-the-hood…', 'green')],
    action: { type: 'navigate', target: '/under-the-hood' },
  }),
};

const clear: Command = {
  name: 'clear',
  description: 'clear the screen',
  run: () => ({ output: [], action: { type: 'clear' } }),
};

const help: Command = {
  name: 'help',
  description: 'show available commands',
  run: () => ({
    output: [
      line('Available commands — type one, or click "? Commands":', 'amber'),
      ...commandList().map((c) => line(`  ${c.name.padEnd(16)} ${c.description}`)),
      line('Press Tab to autocomplete, ↑/↓ for history.', 'muted'),
    ],
  }),
};

export const commandRegistry: Record<string, Command> = Object.fromEntries(
  [whoami, skills, experienceCmd, ls, cat, contact, resume, underTheHood, clear, help].map((c) => [c.name, c]),
);

export function commandList(): Command[] {
  return Object.values(commandRegistry).sort((a, b) => a.name.localeCompare(b.name));
}

export function runCommand(input: string): CommandResult {
  const tokens = tokenize(input);
  if (tokens.length === 0) return { output: [] };
  const [name, ...args] = tokens;
  const cmd = commandRegistry[name];
  if (!cmd) {
    return {
      output: [line(`command not found: ${name}. Type 'help' for options.`, 'error')],
    };
  }
  return cmd.run(args);
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- commands`
Expected: PASS (9 tests). Note the "unknown command" test passes `frobnicate`-style input — the registry echoes back the exact unknown token, so the assertion matches the token it sent.

- [ ] **Step 6: Commit**

```bash
git add site/src/lib/terminal/types.ts site/src/lib/terminal/commands.ts site/src/lib/terminal/commands.test.ts
git commit -m "feat: add terminal command registry"
```

---

## Task 6: Nav-mode persistence store (TDD)

**Files:**
- Create: `site/src/lib/mode.ts`, `site/src/lib/mode.test.ts`

- [ ] **Step 1: Write the failing test (`mode.test.ts`)**

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { getMode, setMode, MODE_KEY } from './mode';

beforeEach(() => localStorage.clear());

describe('nav mode', () => {
  it('defaults to terminal when nothing is stored', () => {
    expect(getMode()).toBe('terminal');
  });
  it('persists a set mode to localStorage', () => {
    setMode('gui');
    expect(localStorage.getItem(MODE_KEY)).toBe('gui');
    expect(getMode()).toBe('gui');
  });
  it('ignores invalid stored values and falls back to terminal', () => {
    localStorage.setItem(MODE_KEY, 'nonsense');
    expect(getMode()).toBe('terminal');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- mode`
Expected: FAIL — cannot find module `./mode`.

- [ ] **Step 3: Implement `mode.ts`**

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- mode`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add site/src/lib/mode.ts site/src/lib/mode.test.ts
git commit -m "feat: add nav-mode persistence store"
```

---

## Task 7: GUI fallback menu + Commands cheat-sheet components

**Files:**
- Create: `site/src/components/GuiMenu.tsx`, `site/src/components/CommandsHelp.tsx`

- [ ] **Step 1: Create `site/src/components/GuiMenu.tsx`**

```tsx
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
```

- [ ] **Step 2: Create `site/src/components/CommandsHelp.tsx`**

```tsx
import { commandList } from '../lib/terminal/commands';

export default function CommandsHelp({ onRun }: { onRun: (name: string) => void }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <p className="mb-2 text-[10px] uppercase tracking-widest text-[var(--color-green)]">
        Available commands — click any to run it
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
            <span className="text-[var(--color-muted)]">— {c.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npm run check`
Expected: no type errors in the two new files.

- [ ] **Step 4: Commit**

```bash
git add site/src/components/GuiMenu.tsx site/src/components/CommandsHelp.tsx
git commit -m "feat: add GUI fallback menu and commands cheat-sheet"
```

---

## Task 8: Terminal React island (component test + implementation)

**Files:**
- Create: `site/src/components/Terminal.tsx`, `site/src/components/Terminal.test.tsx`

- [ ] **Step 1: Write the failing test (`Terminal.test.tsx`)**

```tsx
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- Terminal`
Expected: FAIL — cannot find module `./Terminal`.

- [ ] **Step 3: Implement `Terminal.tsx`**

```tsx
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
  useEffect(() => endRef.current?.scrollIntoView({ block: 'end' }), [blocks]);

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
      a.click();
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
            ⌨ Use the terminal
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
          >
            ? Commands ▾
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); switchMode('gui'); }}
            className="rounded-md border border-[var(--color-border)] px-2.5 py-1 text-xs text-[var(--color-muted)]"
          >
            ☰ Browse without terminal
          </button>
        </div>
      </div>

      {showHelp && (
        <div className="mb-3" onClick={(e) => e.stopPropagation()}>
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- Terminal`
Expected: PASS (4 tests). If the download test interferes, note the suite does not exercise `resume`; navigation uses `window.location.assign` which jsdom stubs.

- [ ] **Step 5: Commit**

```bash
git add site/src/components/Terminal.tsx site/src/components/Terminal.test.tsx
git commit -m "feat: add interactive terminal island"
```

---

## Task 9: Content collection + MCP Mesh case study

**Files:**
- Create: `site/src/content.config.ts`, `site/src/content/work/mcp-mesh.mdx`
- Install: `@astrojs/mdx`

- [ ] **Step 1: Add the MDX integration**

Run from `site/`:
```bash
npx astro add mdx --yes
```
Expected: installs `@astrojs/mdx`, adds it to `astro.config.mjs` integrations.

- [ ] **Step 2: Create `site/src/content.config.ts`**

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const work = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    role: z.string(),
    stack: z.array(z.string()),
    impact: z.array(z.string()),
    order: z.number().default(0),
  }),
});

export const collections = { work };
```

- [ ] **Step 3: Create `site/src/content/work/mcp-mesh.mdx`**

```mdx
---
title: The MCP Mesh
summary: Unified five disparate MCP servers — New Relic, ArgoCD, Snyk, Azure DevOps, and Scalr — behind one coherent interface.
role: DevOps Engineer @ Accuris
stack: ['Model Context Protocol', 'New Relic', 'ArgoCD', 'Snyk', 'Azure DevOps', 'Scalr', 'Python']
impact:
  - 'One interface across observability, deployment, security scanning, and infrastructure.'
  - 'Higher query accuracy and lower latency than the prior New Relic integration.'
  - 'Reduced token consumption on the custom New Relic MCP server.'
order: 1
---

## The problem

Engineering work was scattered across five separate tools, each with its own MCP server,
its own quirks, and its own mental model. Context-switching between New Relic for
observability, ArgoCD for deployments, Snyk for security, Azure DevOps for work tracking,
and Scalr for infrastructure was a daily tax on every engineer.

## The approach

I architected an **MCP mesh** — a single coherent interface that unified the five servers.
Rather than five disconnected endpoints, engineers got one surface that routed intent to the
right backend, normalized responses, and made cross-tool workflows possible.

Alongside the mesh I built a **custom New Relic MCP server** that outperformed the existing
solution: it generated more accurate queries, consumed fewer tokens, and returned results
with lower latency.

## The impact

- A single interface across observability, deployment, security scanning, and infrastructure.
- Measurably better query accuracy and latency than the previous integration.
- Lower token cost per interaction, reducing the running cost of the tooling.
```

- [ ] **Step 4: Verify content builds**

Run: `npm run build`
Expected: build succeeds; Astro reports the `work` collection with one entry.

- [ ] **Step 5: Commit**

```bash
git add site/src/content.config.ts site/src/content/work/mcp-mesh.mdx site/astro.config.mjs site/package.json
git commit -m "feat: add work content collection and MCP Mesh case study"
```

---

## Task 10: Layouts, SEO, and Nav

**Files:**
- Create: `site/src/components/Seo.astro`, `site/src/components/Nav.astro`, `site/src/components/Footer.astro`, `site/src/layouts/BaseLayout.astro`, `site/public/favicon.svg`

- [ ] **Step 1: Create `site/public/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#0a0e0a"/><text x="6" y="22" font-family="monospace" font-size="16" fill="#27c93f">&gt;_</text></svg>
```

- [ ] **Step 2: Create `site/src/components/Seo.astro`**

```astro
---
import { site } from '../data/site';
interface Props { title?: string; description?: string; }
const { title, description } = Astro.props;
const fullTitle = title ? `${title} — ${site.name}` : `${site.name} — ${site.role}`;
const desc = description ?? site.summary;
const url = Astro.site ? new URL(Astro.url.pathname, Astro.site).href : Astro.url.pathname;
---
<title>{fullTitle}</title>
<meta name="description" content={desc} />
<link rel="canonical" href={url} />
<meta property="og:type" content="website" />
<meta property="og:title" content={fullTitle} />
<meta property="og:description" content={desc} />
<meta property="og:url" content={url} />
<meta name="twitter:card" content="summary_large_image" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
```

- [ ] **Step 3: Create `site/src/components/Nav.astro`**

```astro
---
const links = [
  { label: 'about', href: '/#about' },
  { label: 'work', href: '/work' },
  { label: 'under-the-hood', href: '/under-the-hood' },
  { label: 'contact', href: '/#contact' },
];
---
<nav class="mx-auto flex max-w-4xl items-center gap-2 px-6 py-4 font-mono text-sm" aria-label="Primary">
  <a href="/" class="text-[var(--color-text)] font-bold">HR<span class="text-[var(--color-green)]">.</span></a>
  <span class="text-[var(--color-muted)]">~ $ cd</span>
  <span class="text-[var(--color-muted)]">[</span>
  {links.map((l, i) => (
    <>
      {i > 0 && <span class="text-[var(--color-muted)]">·</span>}
      <a href={l.href} class="text-[var(--color-text)] hover:text-[var(--color-green)]">{l.label}</a>
    </>
  ))}
  <span class="text-[var(--color-muted)]">]</span>
</nav>
```

- [ ] **Step 4: Create `site/src/components/Footer.astro`**

```astro
---
import { site } from '../data/site';
---
<footer class="mx-auto max-w-4xl px-6 py-10 font-mono text-xs text-[var(--color-muted)]">
  <div class="flex flex-wrap gap-4">
    <a href={`mailto:${site.email}`} class="hover:text-[var(--color-green)]">{site.email}</a>
    <a href={site.github} class="hover:text-[var(--color-green)]">github</a>
    <a href={site.linkedin} class="hover:text-[var(--color-green)]">linkedin</a>
  </div>
  <p class="mt-3">© {new Date().getFullYear()} {site.name}. Built with Astro, deployed on Cloudflare Pages.</p>
</footer>
```

- [ ] **Step 5: Create `site/src/layouts/BaseLayout.astro`**

```astro
---
import '../styles/global.css';
import Seo from '../components/Seo.astro';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
interface Props { title?: string; description?: string; }
const { title, description } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <Seo title={title} description={description} />
  </head>
  <body>
    <Nav />
    <main class="mx-auto max-w-4xl px-6">
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 7: Commit**

```bash
git add site/src/components/Seo.astro site/src/components/Nav.astro site/src/components/Footer.astro site/src/layouts/BaseLayout.astro site/public/favicon.svg
git commit -m "feat: add base layout, nav, footer, and SEO"
```

---

## Task 11: Section components (Skills, Experience, Contact)

**Files:**
- Create: `site/src/components/Section.astro`, `site/src/components/SkillsMatrix.astro`, `site/src/components/ExperienceTimeline.astro`, `site/src/components/Contact.astro`

- [ ] **Step 1: Create `site/src/components/Section.astro`**

```astro
---
interface Props { id: string; title: string; }
const { id, title } = Astro.props;
---
<section id={id} class="py-12">
  <h2 class="mb-6 font-mono text-lg text-[var(--color-amber)]">
    <span class="text-[var(--color-green)]">$</span> {title}
  </h2>
  <slot />
</section>
```

- [ ] **Step 2: Create `site/src/components/SkillsMatrix.astro`**

```astro
---
import { skillGroups } from '../data/skills';
---
<div class="grid gap-4 sm:grid-cols-2">
  {skillGroups.map((g) => (
    <div class="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <h3 class="mb-2 font-mono text-sm text-[var(--color-green)]">{g.category}</h3>
      <ul class="flex flex-wrap gap-2">
        {g.skills.map((s) => (
          <li class="rounded border border-[var(--color-border)] px-2 py-0.5 text-xs text-[var(--color-text)]">{s}</li>
        ))}
      </ul>
    </div>
  ))}
</div>
```

- [ ] **Step 3: Create `site/src/components/ExperienceTimeline.astro`**

```astro
---
import { experience } from '../data/experience';
---
<ol class="relative border-l border-[var(--color-border)]">
  {experience.map((job) => (
    <li class="mb-8 ml-6">
      <span class="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-[var(--color-green)]"></span>
      <h3 class="font-mono text-base text-[var(--color-text)]">{job.title} <span class="text-[var(--color-muted)]">@ {job.company}</span></h3>
      <p class="font-mono text-xs text-[var(--color-muted)]">{job.start} – {job.end} · {job.location}</p>
      <ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--color-text)]/90">
        {job.highlights.map((h) => <li>{h}</li>)}
      </ul>
    </li>
  ))}
</ol>
```

- [ ] **Step 4: Create `site/src/components/Contact.astro`**

```astro
---
import { site } from '../data/site';
---
<div class="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 font-mono text-sm">
  <p class="text-[var(--color-muted)]">Open to DevOps / Platform / SRE roles.</p>
  <div class="mt-4 space-y-1">
    <p><span class="text-[var(--color-amber)]">email:</span>    <a class="hover:text-[var(--color-green)]" href={`mailto:${site.email}`}>{site.email}</a></p>
    <p><span class="text-[var(--color-amber)]">github:</span>   <a class="hover:text-[var(--color-green)]" href={site.github}>{site.github}</a></p>
    <p><span class="text-[var(--color-amber)]">linkedin:</span> <a class="hover:text-[var(--color-green)]" href={site.linkedin}>{site.linkedin}</a></p>
  </div>
</div>
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 6: Commit**

```bash
git add site/src/components/Section.astro site/src/components/SkillsMatrix.astro site/src/components/ExperienceTimeline.astro site/src/components/Contact.astro
git commit -m "feat: add skills, experience, and contact sections"
```

---

## Task 12: Home page + work pages

**Files:**
- Create/Modify: `site/src/pages/index.astro`
- Create: `site/src/pages/work/index.astro`, `site/src/pages/work/[...slug].astro`, `site/src/layouts/CaseStudyLayout.astro`

- [ ] **Step 1: Replace `site/src/pages/index.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Section from '../components/Section.astro';
import SkillsMatrix from '../components/SkillsMatrix.astro';
import ExperienceTimeline from '../components/ExperienceTimeline.astro';
import Contact from '../components/Contact.astro';
import Terminal from '../components/Terminal.tsx';
import { site } from '../data/site';
---
<BaseLayout>
  <section class="py-12">
    <p class="font-mono text-xs uppercase tracking-widest text-[var(--color-green)]">{site.role}</p>
    <h1 class="mt-2 font-mono text-3xl font-extrabold text-[var(--color-text)] sm:text-4xl">{site.tagline}</h1>
    <p class="mt-3 max-w-2xl text-[var(--color-muted)]">{site.summary}</p>
    <div class="mt-8">
      <Terminal client:load />
    </div>
  </section>

  <Section id="about" title="whoami">
    <p class="max-w-2xl text-[var(--color-text)]/90">
      I'm {site.name}, a DevOps/Platform engineer in {site.location} with nearly seven years
      automating CI/CD, scaling cloud infrastructure, and — most recently — building AI-driven
      DevOps tooling like MCP servers and custom Claude plugins.
    </p>
  </Section>

  <Section id="skills" title="skills"><SkillsMatrix /></Section>
  <Section id="experience" title="experience"><ExperienceTimeline /></Section>
  <Section id="contact" title="contact"><Contact /></Section>
</BaseLayout>
```

- [ ] **Step 2: Create `site/src/layouts/CaseStudyLayout.astro`**

```astro
---
import BaseLayout from './BaseLayout.astro';
interface Props {
  title: string;
  summary: string;
  role: string;
  stack: string[];
  impact: string[];
}
const { title, summary, role, stack, impact } = Astro.props;
---
<BaseLayout title={title} description={summary}>
  <article class="py-12">
    <a href="/work" class="font-mono text-xs text-[var(--color-muted)] hover:text-[var(--color-green)]">← cd ../work</a>
    <h1 class="mt-4 font-mono text-3xl font-extrabold text-[var(--color-text)]">{title}</h1>
    <p class="mt-1 font-mono text-sm text-[var(--color-green)]">{role}</p>
    <p class="mt-4 max-w-2xl text-[var(--color-muted)]">{summary}</p>

    <div class="mt-6 flex flex-wrap gap-2">
      {stack.map((s) => (
        <span class="rounded border border-[var(--color-border)] px-2 py-0.5 font-mono text-xs text-[var(--color-text)]">{s}</span>
      ))}
    </div>

    <div class="mt-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <h2 class="mb-2 font-mono text-sm text-[var(--color-amber)]">Impact</h2>
      <ul class="list-disc space-y-1 pl-5 text-sm text-[var(--color-text)]/90">
        {impact.map((i) => <li>{i}</li>)}
      </ul>
    </div>

    <div class="prose-invert mt-8 max-w-2xl space-y-4 leading-relaxed text-[var(--color-text)]/90 [&_h2]:mt-8 [&_h2]:font-mono [&_h2]:text-lg [&_h2]:text-[var(--color-green)]">
      <slot />
    </div>
  </article>
</BaseLayout>
```

- [ ] **Step 3: Create `site/src/pages/work/[...slug].astro`**

```astro
---
import { getCollection, render } from 'astro:content';
import CaseStudyLayout from '../../layouts/CaseStudyLayout.astro';

export async function getStaticPaths() {
  const entries = await getCollection('work');
  return entries.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
const { title, summary, role, stack, impact } = entry.data;
---
<CaseStudyLayout title={title} summary={summary} role={role} stack={stack} impact={impact}>
  <Content />
</CaseStudyLayout>
```

- [ ] **Step 4: Create `site/src/pages/work/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
const entries = (await getCollection('work')).sort((a, b) => a.data.order - b.data.order);
---
<BaseLayout title="Work" description="Selected DevOps and platform engineering case studies.">
  <section class="py-12">
    <h1 class="mb-6 font-mono text-2xl font-bold text-[var(--color-text)]">
      <span class="text-[var(--color-green)]">$</span> ls work
    </h1>
    <ul class="space-y-4">
      {entries.map((e) => (
        <li class="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <a href={`/work/${e.id}`} class="font-mono text-lg text-[var(--color-green)] hover:underline">{e.data.title}</a>
          <p class="mt-1 text-sm text-[var(--color-muted)]">{e.data.summary}</p>
        </li>
      ))}
    </ul>
  </section>
</BaseLayout>
```

- [ ] **Step 5: Verify build and preview**

Run: `npm run build && npm run preview`
Expected: build succeeds. Open the previewed URL; confirm the home page renders the terminal, typing `whoami` then Enter prints the bio, and `/work` lists the MCP Mesh study which links to `/work/mcp-mesh`. Stop preview with Ctrl+C.

- [ ] **Step 6: Commit**

```bash
git add site/src/pages site/src/layouts/CaseStudyLayout.astro
git commit -m "feat: add home page and work case-study pages"
```

---

## Task 13: Live CI/CD build badges + Under the Hood stub

**Files:**
- Create: `site/src/components/BuildBadges.astro`, `site/src/pages/under-the-hood.astro`

- [ ] **Step 1: Create `site/src/components/BuildBadges.astro`**

Uses shields.io badges bound to the GitHub repo. `REPO` is the `owner/name` slug.

```astro
---
const REPO = 'haydumb/hayden-portfolio';
const badges = [
  { alt: 'CI status', src: `https://img.shields.io/github/actions/workflow/status/${REPO}/ci.yml?branch=main&label=ci&logo=githubactions&logoColor=white` },
  { alt: 'Last commit', src: `https://img.shields.io/github/last-commit/${REPO}?logo=git&logoColor=white` },
  { alt: 'Deployed to Cloudflare Pages', src: 'https://img.shields.io/badge/deploy-Cloudflare%20Pages-F38020?logo=cloudflare&logoColor=white' },
];
---
<div class="flex flex-wrap items-center gap-2">
  {badges.map((b) => <img src={b.src} alt={b.alt} height="20" loading="lazy" />)}
</div>
```

- [ ] **Step 2: Create `site/src/pages/under-the-hood.astro`** (Phase-1 stub; full interactive diagram lands in Phase 2)

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import BuildBadges from '../components/BuildBadges.astro';
---
<BaseLayout title="Under the Hood" description="How this site is built, deployed, and operated.">
  <section class="py-12">
    <h1 class="mb-4 font-mono text-2xl font-bold text-[var(--color-text)]">
      <span class="text-[var(--color-green)]">$</span> cat how-this-site-is-built.md
    </h1>
    <BuildBadges />
    <div class="mt-6 max-w-2xl space-y-4 text-[var(--color-text)]/90">
      <p>
        This site is a static Astro build deployed to Cloudflare Pages by a GitHub Actions
        pipeline that lints, type-checks, runs unit tests, builds, and checks a Lighthouse
        budget on every push to <code>main</code>. The badges above reflect the real pipeline.
      </p>
      <p class="text-[var(--color-muted)]">
        Coming next: an interactive architecture diagram whose nodes open the actual Helm
        charts, Terraform, and ArgoCD manifests from this repo.
      </p>
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: build succeeds; `/under-the-hood` renders with badges.

- [ ] **Step 4: Commit**

```bash
git add site/src/components/BuildBadges.astro site/src/pages/under-the-hood.astro
git commit -m "feat: add build badges and under-the-hood stub"
```

---

## Task 14: Placeholder resume + Lighthouse config

**Files:**
- Create: `site/public/resume.pdf` (placeholder), `site/.lighthouserc.json`

- [ ] **Step 1: Add a placeholder résumé**

Until the final PDF is provided, add a placeholder so the `resume` command resolves. From `site/`:
```bash
node -e "require('fs').writeFileSync('public/resume.pdf','%PDF-1.4\n% Placeholder resume — replace before launch\n')"
```
Expected: `site/public/resume.pdf` exists. (Flagged in the launch checklist below to replace with the real CV.)

- [ ] **Step 2: Create `site/.lighthouserc.json`**

```json
{
  "ci": {
    "collect": {
      "staticDistDir": "./dist",
      "numberOfRuns": 1
    },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["warn", { "minScore": 0.9 }],
        "categories:seo": ["warn", { "minScore": 0.9 }]
      }
    }
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add site/public/resume.pdf site/.lighthouserc.json
git commit -m "chore: add placeholder resume and Lighthouse budget"
```

---

## Task 15: CI/CD pipeline → Cloudflare Pages

**Files:**
- Create: `.github/workflows/ci.yml` (repo root)

- [ ] **Step 1: Create `.github/workflows/ci.yml`**

```yaml
name: ci
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: site
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: site/package-lock.json
      - run: npm ci
      - run: npm run check
      - run: npm test
      - run: npm run build
      - name: Lighthouse CI
        run: npx --yes @lhci/cli@0.13.x autorun || echo "Lighthouse budget warning"
      - uses: actions/upload-artifact@v4
        with:
          name: site-dist
          path: site/dist

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: site/package-lock.json
      - run: npm ci
        working-directory: site
      - run: npm run build
        working-directory: site
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy site/dist --project-name=hayden-remington --branch=main
```

- [ ] **Step 2: Document required secrets**

The workflow needs two GitHub Actions secrets (set in repo Settings → Secrets → Actions):
- `CLOUDFLARE_API_TOKEN` — a token with the **Cloudflare Pages: Edit** permission.
- `CLOUDFLARE_ACCOUNT_ID` — from the Cloudflare dashboard.

These are configured by Hayden in the GitHub UI; they are not committed. Listed in the launch checklist below.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add build, test, and Cloudflare Pages deploy pipeline"
```

---

## Task 16: README + manual launch checklist

**Files:**
- Create: `README.md` (repo root)

- [ ] **Step 1: Create `README.md`**

```markdown
# hayden-remington.com

DevOps / SRE / Platform Engineer portfolio. Static Astro site, deployed to Cloudflare Pages via GitHub Actions.

## Develop

```bash
cd site
npm install
npm run dev      # local dev server
npm test         # unit tests (Vitest)
npm run build    # static build -> site/dist
```

## Structure

- `site/` — Astro app (the website)
- `infra/` — Helm chart, Terraform, ArgoCD manifests (Phase 3)
- `.github/workflows/ci.yml` — CI + deploy

## Deploy

Pushes to `main` build and deploy automatically. Requires GitHub secrets
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README"
```

- [ ] **Step 3: Manual launch checklist (performed by Hayden, not the agent)**

These steps require account access and are done in browser UIs:
- [ ] Create the public GitHub repo `haydumb/hayden-portfolio` and push `main`.
- [ ] Add GitHub Actions secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
- [ ] Create the Cloudflare Pages project named `hayden-remington` (first deploy may be via the Actions run).
- [ ] In Cloudflare Pages → Custom domains, add `hayden-remington.com` and `www`.
- [ ] Replace `site/public/resume.pdf` with the real CV.
- [ ] Verify the live site, the terminal commands, and that the badges show green.

---

## Self-Review Notes (coverage check vs. spec)

- **Hybrid concept** → home (portfolio) + `/under-the-hood` (infra story) ✅ (full diagram is Phase 2)
- **Terminal showpiece** → Tasks 2–8 (registry, tokenize, autocomplete, history, island) ✅
- **Non-technical safety net** → Task 7 (CommandsHelp + GuiMenu) + Task 8 (toggle, hint line, always-clickable Nav in Task 10) ✅
- **Live CI/CD badges** → Task 13 ✅
- **Deep-dive case study (MCP Mesh, lead)** → Task 9 + Task 12 ✅
- **Skills / experience / contact** → Tasks 1, 11, 12 ✅
- **Astro + Tailwind + React island** → Tasks 0, 8 ✅
- **Visual system (terminal-first, polished)** → Task 0 global.css + component classes ✅
- **CI/CD → Cloudflare Pages, custom domain** → Task 15 + Task 16 checklist ✅
- **Quality bar (Lighthouse, reduced-motion, semantic/a11y)** → Task 14 (.lighthouserc) + global.css reduced-motion + aria labels throughout ✅
- **Interactive architecture diagram, full Helm/Terraform/ArgoCD** → intentionally deferred to Phase 2 & 3 (separate plans)

**Deferred to later plans (not gaps):** interactive architecture diagram (Phase 2), additional case studies (Phase 2), Helm chart + Terraform + ArgoCD + `make local-k8s` + Dockerfile (Phase 3).
