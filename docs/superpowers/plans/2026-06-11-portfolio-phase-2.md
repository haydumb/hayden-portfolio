# Portfolio Site — Phase 2 Implementation Plan

> **For agentic workers:** executed via superpowers:subagent-driven-development. Exact code is authored per-task in the dispatch prompts; this plan is the roadmap, file map, interfaces, and test intent.

**Goal:** Ship the interactive architecture diagram (with real `infra/`), richer terminal commands, a Cmd+K palette, an animated metrics strip, a live GitHub/status panel, and three case studies — then deploy to production via the existing CI → Cloudflare pipeline.

**Architecture:** Builds on the Phase 1 Astro 6 + Tailwind v4 + React-island site. New pure/tested modules under `src/lib/`; two new React islands (CommandPalette, MetricsStrip); the diagram is an Astro page + server-rendered Shiki panels + a tiny vanilla toggle script (no island). Terminal command registry is extended and its work-list sourced from the content collection.

**Tech Stack:** Astro 6, Tailwind v4, React 19 islands, Vitest, Astro `<Code>` (Shiki, server-side), Helm/Terraform/Docker (real infra), GitHub Actions → Cloudflare Pages.

---

## File map (new/changed)

```
infra/                                  # NEW — real, valid IaC
  Dockerfile  helm/{Chart.yaml,values.yaml,templates/*}  argocd/application.yaml
  terraform/{main.tf,variables.tf,README.md}
Makefile                                # NEW — dev/build/local-k8s

site/src/lib/theme.ts (+test)           # theme get/set/apply (terminal | matrix | amber | mono)
site/src/lib/palette/filter.ts (+test)  # pure fuzzy filter for the palette
site/src/lib/metrics.ts (+test)         # count/format helper
site/src/lib/terminal/commands.ts       # CHANGED — new commands + context; work list injected
site/src/lib/terminal/types.ts          # CHANGED — CommandContext, theme action
site/src/data/metrics.ts                # NEW — metrics data
site/src/components/Terminal.tsx        # CHANGED — work prop, history context, theme + open/sudo
site/src/components/CommandPalette.tsx (+test)   # NEW global island
site/src/components/MetricsStrip.tsx (+test)     # NEW home island
site/src/components/ArchitectureDiagram.astro    # NEW — lanes + Shiki panels + toggle script
site/src/components/GitHubPanel.astro            # NEW — build-time fetch + fallback
site/src/content/work/{cicd-overhaul,newrelic-mcp-server,anomaly-detection-teams}.mdx
site/src/pages/under-the-hood.astro     # CHANGED — diagram + github panel
site/src/pages/index.astro              # CHANGED — metrics strip
site/src/layouts/BaseLayout.astro       # CHANGED — mount CommandPalette + theme init
site/src/styles/global.css              # CHANGED — [data-theme] palettes
```

## Tasks (sequenced)

1. **Real `infra/`** — Dockerfile (multi-stage Astro build → nginx:alpine), Helm chart
   (Chart.yaml, values.yaml, templates: deployment/service/ingress/_helpers), ArgoCD Application,
   Terraform (Cloudflare Pages project + DNS), Makefile. Validate with `helm lint`/`helm template`
   and `terraform fmt -check`/`validate` if tools present; else syntactic review. Commit.

2. **Theme module + CSS palettes** (TDD) — `src/lib/theme.ts`: `THEMES`, `getTheme()`,
   `setTheme()`, `applyTheme()` (sets `documentElement.dataset.theme` + localStorage `site-theme`,
   guarded for SSR). `global.css`: `[data-theme="matrix"|"amber"|"mono"]` override blocks. Tests
   with mocked localStorage/documentElement.

3. **Palette fuzzy filter** (TDD) — `src/lib/palette/filter.ts`: `fuzzyFilter(query, items)` →
   subsequence match + simple score, case-insensitive, stable order. Tests.

4. **Metrics data + helper** (TDD) — `src/data/metrics.ts` (array of `{value,prefix?,suffix?,label}`)
   and `src/lib/metrics.ts`: `formatMetric()` + `countTo(progress, target)` easing helper. Tests.

5. **Extend command registry** (TDD) — `types.ts`: add `CommandContext { history: string[]; work: {slug,title}[] }`,
   add `'theme'` to CommandAction.type. `commands.ts`: `runCommand(input, ctx?)`; commands receive
   `(args, ctx)`. Add `neofetch`, `history`, `theme`, `open`, `sudo` (handles `sudo hire-me`).
   Replace hardcoded WORK: `ls`/`cat`/`open` read `ctx.work` (fallback to [] ). Keep all existing
   tests green; add tests for new commands (with a stub ctx).

6. **Terminal island update** — `Terminal.tsx`: accept `work` prop; build ctx `{history, work}` and
   pass to `runCommand`; handle `theme` action (applyTheme); keep existing tests passing, add a
   theme-action test. Home/under-the-hood pass `work` from the collection.

7. **CommandPalette island** (+test) — global, `client:idle`, ⌘K/Ctrl+K opens accessible modal;
   destinations prop (pages, sections, case studies, actions); uses `fuzzyFilter`; keyboard nav;
   Esc/click-out close; focus trap. Test: shortcut opens, filter narrows, Enter activates.

8. **MetricsStrip island** (+test) — renders final values server-safe; animates from 0 on
   IntersectionObserver; reduced-motion → instant. Wire below hero in `index.astro`. Test renders
   final values.

9. **Three case studies** — MDX with schema + problem/approach/impact for cicd-overhaul,
   newrelic-mcp-server, anomaly-detection-teams. Build confirms 4 work entries → 6 pages added.

10. **Architecture diagram + GitHub panel** — `ArchitectureDiagram.astro`: read real files via
    `node:fs` in frontmatter; render nodes (two lanes, SVG connectors) + hidden Shiki `<Code>`
    panels per node + "View on GitHub" links; inline vanilla script toggles panels + active state +
    keyboard. `GitHubPanel.astro`: build-time fetch (try/catch + fallback) of latest commit + CI
    conclusion. Rewrite `under-the-hood.astro` to use both (keep BuildBadges).

11. **Integration** — mount CommandPalette + theme-init snippet in BaseLayout; pass `work` +
    palette destinations from pages; verify full `npm test`, `astro check`, `npm run build`,
    Lighthouse-affecting a11y (keyboard + labels on palette/diagram).

12. **Deploy** — merge `phase-2` → `main`, push; watch CI; confirm deploy green + live site.

## Test intent

- Pure modules (theme, filter, metrics, command behaviors, work-list sourcing) → Vitest TDD.
- Islands (CommandPalette, MetricsStrip, Terminal additions) → @testing-library/react component tests.
- All existing 31 tests remain green; `astro check` 0 errors; build succeeds; a11y gate holds.

## Notes / decisions (autonomous)

- Diagram highlighting is server-side Shiki (`astro:components` `<Code>`); no client highlighter.
- GitHub fetch is unauthenticated + resilient (never breaks build).
- Theme palettes recolor accents only (keep contrast ≥ AA on every theme).
- `make local-k8s` / infra is real but not wired to production; copy stays honest.
