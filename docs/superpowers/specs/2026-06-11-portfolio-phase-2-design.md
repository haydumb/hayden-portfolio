# Portfolio Site — Phase 2 Design Spec

**Date:** 2026-06-11
**Owner:** Hayden Remington
**Status:** Approved (user delegated autonomous completion + production deploy)

## Goal

Elevate the live portfolio from "great" to "memorable" with: an interactive architecture
diagram backed by **real** infrastructure files, richer terminal commands, a Cmd+K command
palette, an animated impact-metrics strip, a live GitHub/status panel, and three more case
studies — all shipped through the existing CI → Cloudflare Pages pipeline.

## Scope (approved)

1. Interactive architecture diagram + real `infra/` files (core).
2. Richer terminal commands: `neofetch`, `history`, `theme`, `open`, `sudo hire-me`.
3. Cmd+K command palette.
4. Animated impact-metrics strip on the home page.
5. Live GitHub + status panel on `/under-the-hood` (build-time fetch, resilient).
6. Three more case studies + terminal sourced from the content collection.

---

## 1. Real `infra/` files

Create genuine, valid infrastructure at the repo root so the diagram opens real code:

```
infra/
  Dockerfile               # multi-stage: build Astro static, serve via nginx:alpine
  helm/
    Chart.yaml
    values.yaml
    templates/
      deployment.yaml
      service.yaml
      ingress.yaml
      _helpers.tpl
  argocd/
    application.yaml       # ArgoCD Application (GitOps) pointing at infra/helm
  terraform/
    main.tf                # Cloudflare Pages project + DNS records
    variables.tf
    README.md
Makefile                   # make dev / make build / make local-k8s (kind)
```

- Files must be syntactically valid: `helm template`-clean, `terraform validate`-clean,
  `docker build`-valid (validate where tooling is available in CI/local; otherwise lint
  syntactically). The plan includes a `helm lint`/`terraform fmt -check` step where feasible.
- **Honesty:** the live public site continues to deploy via Cloudflare Pages. The `infra/`
  path is a real, reproducible GitOps deployment runnable locally via `make local-k8s` (kind).
  The diagram and copy label the two paths truthfully; no claim that a 24/7 cluster is serving
  production.

## 2. Interactive architecture diagram (`/under-the-hood`)

- Implemented as an **Astro page with server-rendered code panels + a tiny vanilla script**
  (no heavy client framework): file contents are read at build via `node:fs` in the page
  frontmatter and highlighted server-side with Astro's built-in `<Code>` (Shiki) — zero client
  JS for highlighting.
- Two labeled lanes with SVG connectors:
  - **Live path:** GitHub → GitHub Actions → Cloudflare Pages → haydenremington.com
  - **GitOps path:** Dockerfile → Helm → ArgoCD → Kubernetes
- Each node is a `<button>`; clicking shows the corresponding pre-rendered file panel and sets
  active styling. A small inline script toggles panel visibility by id and manages active state
  + keyboard support (Enter/Space, arrow nav optional). Each panel has a "View on GitHub" link
  to the file on `main`.
- Node → file map: GitHub Actions→`.github/workflows/ci.yml`; Cloudflare Pages→`astro.config.mjs`;
  Dockerfile→`infra/Dockerfile`; Helm→`infra/helm/values.yaml` + `templates/deployment.yaml`;
  ArgoCD→`infra/argocd/application.yaml`; Kubernetes→`infra/helm/templates/deployment.yaml`;
  Terraform→`infra/terraform/main.tf`.
- Default state shows the live path with a short explanatory caption; reduced-motion safe;
  responsive (lanes stack on mobile).

## 3. Richer terminal commands

Extend the existing pure command registry (`src/lib/terminal/commands.ts`):
- `neofetch` — ASCII "HR" logo beside a system-info card (role, location, stack, "uptime"=years,
  shell, theme). Pure output.
- `history` — lists the session's command history. Implemented by passing current history into
  the command context (small registry signature change: commands optionally receive a context
  object) OR a dedicated handler in the island; keep registry pure by giving `runCommand` an
  optional context `{ history: string[] }`.
- `theme [matrix|amber|mono]` — returns a new action `{type:'theme', target}`; the island applies
  `document.documentElement.dataset.theme` and persists to localStorage (`site-theme`). No arg or
  bad arg → prints usage + current theme. CSS defines the three palettes via `[data-theme=...]`.
- `open <slug>` — alias for `cat work/<slug>` (navigates to the case study).
- `sudo hire-me` — easter egg: prints a granted message + navigates to `/#contact`.
- `help` and the `? Commands` cheat-sheet include the new commands automatically.
- All registry logic stays unit-tested. The `theme` apply + persistence is tested at the island
  level. A pure `applyTheme`/`getTheme`/`setTheme` module (like `mode.ts`) holds the side-effects,
  unit-tested with a mocked localStorage/documentElement.

## 4. Cmd+K command palette

- A global React island mounted in `BaseLayout` with `client:idle`.
- Listens for ⌘K / Ctrl+K (and `/` optionally) to open an accessible modal overlay: focus-trapped,
  Esc closes, click-outside closes, `aria-modal`, labelled.
- Shows a fuzzy-filterable list of **destinations** from a shared registry: pages (Home, Work,
  Under the Hood), home sections (About, Skills, Experience, Contact), each case study (from the
  content collection, passed in as a prop), and actions (Download résumé, Switch theme →
  matrix/amber/mono, GitHub, LinkedIn). Arrow keys move selection; Enter activates; type to filter.
- Fuzzy filter is a **pure, unit-tested function** (`src/lib/palette/filter.ts`).
- Destinations that are case studies come from the content collection so the palette stays in sync.

## 5. Animated impact-metrics strip (home)

- A band below the hero rendering counters from an editable data module
  (`src/data/metrics.ts`): e.g. `{ value: 7, suffix: '+', label: 'years in DevOps' }`,
  `{ value: 30, prefix: '−', suffix: '%', label: 'deploy time' }`,
  `{ value: 25, prefix: '−', suffix: '%', label: 'cloud cost' }`,
  `{ value: 5, label: 'MCP servers unified' }`.
- A small React island (`client:visible`) animates each from 0 when scrolled into view via
  IntersectionObserver. **Reduced-motion / SSR:** the final value is rendered in the DOM as text
  (so screen readers and no-JS users always see the real number); the animation only re-counts
  visually. A pure `easeCount`/formatting helper is unit-tested.

## 6. Live GitHub + status panel + case studies

- **GitHub panel** (`/under-the-hood`): a build-time fetch (Astro frontmatter, Node) from the
  public GitHub REST API for `haydumb/hayden-portfolio`: latest `main` commit SHA + date, latest
  `ci.yml` workflow run conclusion, and commit count (or repo pushed_at). **Resilience:** wrapped
  in try/catch with a graceful fallback card (links to the Actions tab) so a rate-limit/outage
  never breaks the build. Honestly labeled ("last build", "latest commit").
- **Three case studies** as MDX in `src/content/work/`: `cicd-overhaul.mdx`,
  `newrelic-mcp-server.mdx`, `anomaly-detection-teams.mdx`, each with the existing schema
  (title, summary, role, stack, impact, order) + problem/approach/impact body.
- **Terminal/collection sync:** replace the hardcoded `WORK` array in `commands.ts` by passing the
  work list (slug+title, from the content collection) into the Terminal island as a prop and into
  `runCommand` via context, so `ls work` / `cat` / `open` reflect all case studies automatically.
  Order by the collection's `order` field.

## Architecture & boundaries

- New pure/tested modules: `src/lib/palette/filter.ts` (fuzzy filter), `src/lib/theme.ts`
  (theme get/set/apply), `src/lib/metrics.ts` helper (count/format), extended
  `src/lib/terminal/commands.ts` (new commands + context param).
- New islands: `CommandPalette.tsx` (global), `MetricsStrip.tsx` (home). Diagram is Astro + inline
  script (no island). Terminal island gains a `work` prop and theme handling.
- Data modules: `src/data/metrics.ts`, shared palette destinations derived at page level.
- Each file keeps one clear responsibility; the command registry stays the single source for
  terminal behavior.

## Testing & quality

- TDD for all pure logic: fuzzy filter, theme module, metrics helper, new command behaviors,
  collection-sourced work list.
- Component tests for CommandPalette (open via shortcut, filter, select) and MetricsStrip
  (renders final values; respects reduced-motion).
- Existing 31 tests must continue to pass; `astro check` 0 errors; `npm run build` succeeds; the
  Lighthouse a11y gate (≥0.9 error threshold) must hold — new interactive UI must be keyboard
  accessible and labelled.
- Ships through the existing CI → Cloudflare Pages pipeline; merge to `main` deploys.

## Out of scope (future)

- Running a real 24/7 managed cluster (kind/`make local-k8s` covers the demonstration).
- A blog/notes section.
- Authenticated GitHub API (unauthenticated build-time fetch with fallback is sufficient).
