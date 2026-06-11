# DevOps / SRE / Platform Engineer Portfolio Site — Design Spec

**Date:** 2026-06-11
**Owner:** Hayden Remington
**Status:** Approved (brainstorming), pending implementation plan

## Goal

A professional portfolio website that both **describes** and **demonstrates** Hayden's
DevOps / SRE / Platform Engineering skills. It must impress two audiences at once:
non-technical recruiters/hiring managers (clean, skimmable, easy to navigate) and
technical engineers/platform leads (real Helm charts, GitOps, CI/CD, live architecture).

## Core Decisions

| Decision | Choice |
| --- | --- |
| Concept | **Hybrid** — polished portfolio front-end + an "Under the Hood" infrastructure showcase |
| Infra realism | **Real CI/CD + static host.** Live site is static; Helm + Terraform + ArgoCD live in the public repo and run locally on kind. Nothing faked. |
| Frontend stack | **Astro + Tailwind** (static output, React islands for interactivity) |
| Visual direction | **Terminal / Hacker, refined** — terminal-first motif with polished, readable long-form content ("a beautifully designed developer tool," not a 1980s CRT) |
| Hosting | **Cloudflare Pages** (free, custom domain, automatic HTTPS) |
| Repo | Public monorepo on GitHub |
| Assets on hand | Domain name, cloud account, public GitHub account |

## Site Map & Navigation

- **`/` Home** — single scrolling page: terminal hero → skills matrix → experience timeline →
  featured work → contact.
- **`/work/[slug]`** — deep-dive case study pages (one per featured project), authored in MDX.
- **`/under-the-hood`** — infrastructure showcase: interactive architecture diagram, live
  CI/CD status, and "how this site is built."
- Top nav styled as a shell prompt: `~ $ cd [ about · work · under-the-hood · contact ]`.
  The nav links are **always plain clickable links**, independent of terminal mode.

## Visual System

- Near-black background (`#0a0e0a`), off-white body text, **green (`#27c93f`)** + **amber
  (`#ffbd2e`)** accents.
- **JetBrains Mono / SF Mono** for headings, prompts, and code; **Inter** (clean sans) for
  long-form case-study prose to keep reading comfortable.
- Motifs: mac-style traffic-light dots, blinking cursor, `prompt $` prefixes, hero typed-text
  animation, very subtle scanline/grid texture.
- Fully responsive. Respects `prefers-reduced-motion` (disables typing/cursor animation).

## Signature Showpieces

### 1. Interactive Terminal (hero + dedicated section)
- A real navigation layer. Commands route to actual content:
  `whoami`, `skills`, `ls work`, `cat work/<slug>`, `experience`, `resume`, `under-the-hood`,
  `contact`, `help`.
- Features: Tab autocompletion, command history (↑/↓), easter eggs (e.g. `sudo hire-me`).
- Implemented as a self-contained React island with a small **command registry**
  (each command = a function returning output), so it is easy to extend.

### 2. Interactive Architecture Diagram (`/under-the-hood`)
- Clickable nodes showing two honest paths:
  - **Live path:** `GitHub → GitHub Actions (build/test/lint) → Cloudflare Pages`.
  - **GitOps path:** `Helm chart → ArgoCD → Kubernetes`.
- Clicking a node opens the **actual file** from the repo (workflow YAML, Helm `values.yaml`,
  Terraform, ArgoCD `Application`).

### 3. Live CI/CD Status + Build Badges
- Pulls real GitHub Actions run status for this repo (build-time GitHub API call and/or
  shields.io badges): last deploy, commit SHA, passing checks. Proof the pipeline is real.

### 4. Deep-Dive Case Studies
- Long-form, **problem → approach → impact**, with diagrams. Authored in MDX via Astro content
  collections (type-safe frontmatter).

## Non-Technical Navigation Safety Net

So no visitor is ever stuck at a blinking cursor:

1. **`? Commands ▾` dropdown** — a cheat-sheet listing every command with a plain-English
   description; **each row is clickable to auto-run** the command (the terminal teaches itself).
2. **`☰ Browse without terminal` toggle** — swaps the terminal for a simple clickable card menu
   (About / Work / Under the Hood / Contact). Preference persisted in `localStorage`.
3. **Top nav bar is always plain clickable links**, regardless of mode — the terminal is a bonus
   layer, never a gate.
4. Persistent hint line (`New here? Type help or click ? Commands`) + Tab-completion coaching.

## Content Plan (from résumé)

Featured case studies:
1. **The MCP Mesh** — unifying New Relic, ArgoCD, Snyk, ADO & Scalr behind one coherent interface.
2. **Custom New Relic MCP Server** — beat the existing solution: higher query accuracy, fewer
   tokens, lower latency.
3. **CI/CD Overhaul** — Azure DevOps pipelines, **−30% deploy time**, nightly automated testing.
4. **Cloud Cost Optimization** — **−25%** via resource right-sizing + monitoring.
5. *(secondary)* Databricks CDC ingestion feeding AI models; New Relic anomaly detection → Teams
   via Power Automate.

Supporting content:
- Skills matrix grouped: Cloud / CI-CD / IaC / AI-Automation / Observability / Data / Languages.
- Experience timeline (Accuris → TransCore arc, 2021–2026).
- Downloadable résumé.
- Contact: email, GitHub, LinkedIn.

## Technical Architecture

- **Astro + Tailwind**, static output. Interactive showpieces are **React islands**
  (`client:visible` / `client:load`); the rest of the page ships near-zero JS.
- Case studies in **Markdown/MDX** via Astro content collections.
- Terminal island uses a command registry pattern for extensibility.

## Repository & Infrastructure

Public monorepo:

```
/site                  → Astro app (the website)
/infra
  /helm                → Helm chart that deploys the containerized site
  /terraform           → Terraform (Cloudflare Pages project / DNS, and/or a k8s namespace)
  /argocd              → ArgoCD Application manifest (GitOps)
/.github/workflows     → CI/CD (build, test, lint, deploy)
Dockerfile
Makefile               → make dev / make local-k8s
docs/                  → specs and writeups
```

**Honesty contract:** the live site serves static from Cloudflare Pages (free/fast). The *same*
container has a real Helm chart + ArgoCD Application + Terraform, and a documented
`make local-k8s` that runs it on **kind** with ArgoCD managing it. The architecture diagram shows
both paths truthfully — the K8s/Helm/ArgoCD path genuinely works and is reproducible by anyone
who clones the repo.

## CI/CD & Hosting

- **GitHub Actions:** lint + typecheck + build + Lighthouse-CI budget check + deploy to
  **Cloudflare Pages** on push to `main`. Run status feeds the live badges.
- Custom domain via Cloudflare DNS; automatic HTTPS.

## Quality Bar

- Lighthouse ≥ 95 (performance / a11y / best-practices / SEO), enforced in CI.
- Keyboard-navigable terminal & diagram; `prefers-reduced-motion` support; semantic HTML.
- Open Graph / social meta tags for clean link previews.

## Phasing

- **Phase 1 (MVP):** Astro skeleton; terminal hero with command registry + non-technical safety
  net; skills; experience; contact; one case study; deployed via GitHub Actions → Cloudflare
  Pages with the real pipeline + live badges. A complete, live, impressive site on its own.
- **Phase 2:** remaining case studies + `/under-the-hood` interactive architecture diagram.
- **Phase 3:** full Helm / Terraform / ArgoCD infra + `make local-k8s`, wired into the diagram's
  clickable files.

## Out of Scope (for now)

- Blog / writeups feed (can be added later via the same content-collection pattern).
- A 24/7 managed Kubernetes cluster (the kind-based local path covers the demonstration need).
- Backend services / databases — the site is static by design.
