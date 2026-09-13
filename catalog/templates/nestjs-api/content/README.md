# ${{ values.name }}

${{ values.description }}

NestJS API service scaffolded from the Company Internal Developer Platform.

## Stack

- NestJS 11
- SST v3 on AWS (ECS Fargate + load balancer)
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
npm run start:dev
```

API endpoints:

- `GET /api` — service metadata
- `GET /api/health` — health check

## Deploy locally with SST

```sh
npm install
npx sst deploy --stage dev
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

This service deploys to `${{ values.awsRegion }}`.

## Catalog

Registered in Backstage under the `client-delivery` system with owner `${{ values.owner }}`.
