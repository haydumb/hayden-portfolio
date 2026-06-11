# haydenremington.com

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
