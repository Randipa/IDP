# Company Internal Developer Platform (IDP)

Backstage-based developer portal for standardized project creation, AWS/SST deployments, and automated security and quality checks across dev, staging, and production.

## Prerequisites

- Node.js 22 or 24
- Yarn 4 (included via Corepack)
- Docker (for PostgreSQL)
- GitHub Personal Access Token with `repo` scope

## Quick Start

**Full manual steps:** [`docs/MANUAL-RUN-GUIDE.md`](docs/MANUAL-RUN-GUIDE.md) (local run + optional AWS)

**Existing Next.js project deploy:** [`docs/DEPLOY-EXISTING-NEXTJS.md`](docs/DEPLOY-EXISTING-NEXTJS.md)

### Fastest way (no Docker)

```sh
cd /home/saliya/Pictures/IDP
yarn install
yarn start
```

Open **http://localhost:3000**

### Recommended local setup (PostgreSQL)

```sh
yarn install
cp .env.example .env
cp app-config.local.yaml.example app-config.local.yaml
docker compose up -d
yarn start
```

## Local Development Modes

| Mode | Database | Setup |
|------|----------|-------|
| Quick start | In-memory SQLite | `yarn start` only |
| Recommended | PostgreSQL | Docker + `app-config.local.yaml` |

## Scripts

| Command | Description |
|---------|-------------|
| `yarn start` | Start frontend and backend |
| `yarn db:up` | Start PostgreSQL container |
| `yarn db:down` | Stop PostgreSQL container |
| `yarn build:all` | Build all packages |
| `yarn test` | Run tests |

## Configuration

- `app-config.yaml` — shared Backstage configuration
- `app-config.local.yaml` — local PostgreSQL overlay (gitignored, copy from example)
- `.env` — secrets and database connection values (gitignored)

## Platform infrastructure

Deploy GitHub OIDC and AWS IAM roles:

```sh
cd platform-infra
npm install
cp .env.example .env
export $(grep -v '^#' .env | xargs)
npm run deploy:platform
```

See [`docs/phase-2-github-aws-setup.md`](docs/phase-2-github-aws-setup.md), [`docs/phase-3-sonarqube-setup.md`](docs/phase-3-sonarqube-setup.md), [`docs/phase-4-backstage-plugins.md`](docs/phase-4-backstage-plugins.md), and [`docs/phase-5-deploy-idp-to-aws.md`](docs/phase-5-deploy-idp-to-aws.md) for platform setup guides.

Reusable CI workflows live in [`.github/workflows/`](.github/workflows/) and are documented in [`shared/github-actions/README.md`](shared/github-actions/README.md).

Deploy SonarQube:

```sh
cd platform-infra
npm run deploy:sonarqube
```

## Roadmap

1. ~~Software catalog and org structure~~
2. ~~NestJS API software template~~
3. ~~Next.js fullstack software template~~
4. ~~GitHub OIDC + reusable deploy workflows~~
5. ~~Self-hosted SonarQube integration~~
6. ~~Backstage plugins (GitHub, AWS, SonarQube)~~
7. ~~Deploy Backstage IDP to AWS~~

Deploy the portal:

```sh
cd idp-infra
npm install
cp .env.example .env
export $(grep -v '^#' .env | xargs)
npm run deploy:staging
```

See [`docs/phase-5-deploy-idp-to-aws.md`](docs/phase-5-deploy-idp-to-aws.md).

## Catalog Structure

See [`catalog/README.md`](catalog/README.md) for entity layout and conventions.
