# Andriiana — Portfolio

Single-page portfolio site for an SMM specialist, built from a Figma design.
Dark, bold, playful visual style with scroll-reveal animations.

**Live site (GitHub Pages):** https://vousya.github.io/andriiana-portfolio/

## Stack

- [Astro](https://astro.build) — static site generator
- [Tailwind CSS v4](https://tailwindcss.com) — styling
- **Containerized** with a multi-stage Docker build + hardened Nginx
- **CI/CD** via GitHub Actions → **GHCR** → **Azure Kubernetes Service (AKS)**

## Develop

```bash
npm install      # install dependencies
npm run dev      # dev server with hot reload (http://localhost:4321)
npm run build    # production build -> dist/
npm run preview  # preview the production build
npm run format   # Prettier (write)
npm run test:e2e # Playwright e2e (expects a server on BASE_URL)
```

---

## DevOps: container → CI/CD → Kubernetes

This repo carries a full cloud-native delivery pipeline for the static site.

### 1. Container image (multi-stage, hardened)

`Dockerfile` builds in two stages:

1. **builder** (`node:22-alpine`) — `npm ci` + `astro build` at site root (`BASE_PATH=/`).
2. **runtime** (`nginxinc/nginx-unprivileged`) — copies only `dist/`. Runs as
   **uid 101 (non-root)**, listens on **:8080**, ships a `/healthz` endpoint,
   gzip, long-cache for hashed assets, and strict security headers (CSP,
   X-Frame-Options, nosniff). A `HEALTHCHECK` is baked in.

```bash
docker build -t portfolio:local .
docker run --rm -p 8080:8080 portfolio:local
# -> http://localhost:8080   /   http://localhost:8080/healthz
```

The base path is env-driven (`astro.config.mjs`) so the **same source** builds
for GitHub Pages (`/andriiana-portfolio/`) and for the container (`/`).

### 2. CI/CD pipeline — `.github/workflows/ci-cd.yml`

| Job            | What it does                                                                                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **quality**    | Prettier check · `astro build` · hadolint (Dockerfile) · actionlint                                                                                                |
| **test**       | Builds the image, runs it, runs **Playwright e2e against the real container**                                                                                      |
| **build-push** | Multi-arch (amd64+arm64) build → **GHCR**; **Trivy** scan (fails on HIGH/CRITICAL) → code scanning; **SBOM** (SPDX); **cosign** keyless signing + SBOM attestation |
| **deploy**     | `az login` → AKS context → `kustomize set image` (digest-pinned) → `kubectl apply -k` → rollout status                                                             |

Image: `ghcr.io/vousya/andriiana-portfolio` — tagged with short SHA, branch,
semver (on `vX.Y.Z` tags) and `latest`.

### 3. Kubernetes manifests — `k8s/` (kustomize)

`Deployment` (2 replicas, rolling update, `maxUnavailable: 0` for zero-downtime),
`Service` (ClusterIP), `Ingress` (AKS managed NGINX), `HorizontalPodAutoscaler`
(CPU 70%, 2→5), `PodDisruptionBudget` (minAvailable 1). Pods run **non-root**,
**read-only root filesystem**, **all capabilities dropped**, `RuntimeDefault`
seccomp, with CPU/memory requests + limits and liveness/readiness probes.

```bash
kubectl kustomize k8s/        # render & inspect
kubectl apply -k k8s/         # apply to the current cluster context
```

### 4. Provision AKS

```bash
az login
./scripts/aks-up.sh           # RG + AKS + managed ingress + deploy (~6 min)
# ... grab the printed public IP ...
./scripts/aks-down.sh         # DELETE everything — stops billing
```

> The GHCR package must be **public** (or configure an `imagePullSecret`) for
> AKS to pull it without credentials.

---

## CI/CD repo configuration (one-time)

- **GHCR**: uses the built-in `GITHUB_TOKEN` — no setup beyond making the
  package public after the first push (Packages → portfolio → visibility).
- **AKS deploy job** (optional; pipeline stays green without it):
  - Secret `AZURE_CREDENTIALS` — service-principal JSON (`az ad sp create-for-rbac --sdk-auth`).
  - Variables `AKS_RESOURCE_GROUP`, `AKS_CLUSTER`.

## Editing content

- **Case studies:** `src/data/projects.js`
- **About / bio:** `src/components/About.astro`
- **Contact links:** `src/components/Contact.astro`
- **Images:** `public/img/`
