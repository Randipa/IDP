# ${{ values.name }}

${{ values.description }}

Next.js fullstack application scaffolded from the Company Internal Developer Platform.

## Stack

- Next.js 15 App Router + React 19
- API routes under `app/api`
- SST v3 `Nextjs` component on AWS
- GitHub Actions (lint, test, security scans, SST deploy)

## SST stages

| Stage | Branch / trigger | Purpose |
|-------|------------------|---------|
| `dev` | push to `develop` | Developer integration |
| `staging` | push to `main` | Pre-production validation |
| `production` | manual workflow dispatch | Live workloads |

## Local development

```sh
npm install
npm run dev
```

Routes:

- `/` — application home page
- `/api/hello` — service metadata JSON
- `/api/health` — health check JSON

## Deploy locally with SST

```sh
npm install
npx sst dev
```

## Required GitHub secrets

Configure these after deploying platform infrastructure from the `company-idp` repository (`platform-infra/`):

| Secret | Description |
|--------|-------------|
| `AWS_ROLE_ARN` | IAM role ARN from `company-idp-github-deploy-<stage>` |
| `SONAR_HOST_URL` | Base URL from `npm run deploy:sonarqube` output |
| `SONAR_TOKEN` | SonarQube analysis token |

Reusable workflows are loaded from `${{ values.idpRepo }}` at ref `${{ values.idpRef }}`.

Production deploys require a passing SonarQube quality gate.

## AWS region

This application deploys to `${{ values.awsRegion }}`.

## Branch setup

Create a `develop` branch after scaffolding to enable automatic dev deployments:

```sh
git checkout -b develop
git push -u origin develop
```

## Catalog

Registered in Backstage under the `client-delivery` system with owner `${{ values.owner }}`.
