# Portfolio Site — Phase 3 Design Spec

**Date:** 2026-06-12
**Owner:** Hayden Remington
**Status:** Approved (user chose the CI-verified-proof approach; delegated autonomous completion + deploy)

## Goal

Make the GitOps path genuinely *real and self-verifying* at zero cost: a CI job deploys the
actual Helm chart to a real (ephemeral) Kubernetes cluster on every change, smoke-tests the
running pod, and the site surfaces a live "GitOps deployment — verified ✓" proof on
`/under-the-hood`. No cloud account, no credentials, no ongoing cost or security upkeep.

## Why this approach

For a portfolio, a reproducible, self-verifying proof is more credible than a pet cluster:
it shows the exact Helm chart deploying to real Kubernetes and serving the site, green on every
commit, with the captured `kubectl`/Helm output one click away.

## 1. Verification workflow — `.github/workflows/gitops-verify.yml`

Triggers: push to `main` (paths `infra/**`, `site/**`, the workflow itself), `workflow_dispatch`,
and a weekly `schedule`.

Must-pass steps (the job's pass/fail rides on these — all rock-solid):
1. `docker build -t hayden-portfolio:ci -f infra/Dockerfile .` — build the real image.
2. `helm/kind-action` — stand up a real Kubernetes cluster in CI (kind).
3. `kind load docker-image hayden-portfolio:ci`.
4. `helm lint infra/helm`.
5. `helm install site infra/helm --set image.repository=hayden-portfolio --set image.tag=ci
   --set image.pullPolicy=Never --set ingress.enabled=false --wait` then
   `kubectl rollout status deploy/site-hayden-portfolio`.
6. **Smoke test:** `kubectl port-forward` the Service and `curl` it — assert **HTTP 200** and that
   the body contains `Hayden Remington`. Proves the container serves the site inside K8s.
7. Validate GitOps manifests: `helm template | kubeconform` (best-effort) and
   `kubectl apply --dry-run=client -f infra/argocd/application.yaml`.

Best-effort (non-blocking, `continue-on-error`):
8. Install ArgoCD into the cluster and apply a CI-adapted `Application`; capture
   `kubectl -n argocd get applications`. Bonus realism; never fails the job.

Reporting: write a rich `$GITHUB_STEP_SUMMARY` (kubectl get all, rollout status, curl result)
and upload a report artifact.

## 2. Site proof panel — `src/components/GitOpsProof.astro`

Build-time fetch (same resilient pattern as `GitHubPanel.astro`) of the latest
`gitops-verify.yml` run via the GitHub API. Renders:
- **"GitOps deployment — verified ✓"** when the latest run concluded `success`, with the date,
  short commit SHA, and a **"see the run logs ↗"** link to the run.
- A neutral "last run: <status>" state otherwise; a graceful fallback (link to the workflow) if
  the API is unavailable. Never breaks the build.

Placed on `/under-the-hood` directly under the architecture diagram.

## 3. Honesty upgrade (copy)

Update the `/under-the-hood` GitOps paragraph from "reproducible locally" to:
"verified on every change — this exact Helm chart is deployed to a real Kubernetes cluster and
smoke-tested in CI (see the proof above). Run it yourself with `make local-k8s`."

## 4. Verification & landing it green

- The site panel is build-verified (`npm run build`) and the page renders.
- The workflow's correctness is proven by the run itself: after merge to `main`, watch the
  `gitops-verify` run and fix anything red before declaring done (kind+Helm+smoke-test is a
  standard, reliable Actions pattern).
- Once `gitops-verify` is green, re-run the deploy so the site panel picks up the success state.

## Architecture & boundaries

- One new workflow file; one new resilient Astro component; a small copy/markup change to
  `under-the-hood.astro`. No changes to existing tests or app logic. The 64-test suite stays green.

## Out of scope

- A 24/7 managed or free-tier cluster (a possible future follow-up; the infra already supports it).
- Pushing images to a registry / live ArgoCD sync as a *required* step (kept best-effort).
