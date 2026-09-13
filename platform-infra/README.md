# Platform Infrastructure

Deploys shared AWS resources used by all scaffolded services.

## Stacks

| SST stage | Command | Resources |
|-----------|---------|-----------|
| `platform` | `npm run deploy:platform` | GitHub OIDC provider + IAM deploy roles |
| `sonarqube` | `npm run deploy:sonarqube` | SonarQube on ECS Fargate + RDS PostgreSQL |

## Prerequisites

- AWS CLI configured for the target account
- Node.js 20+
- GitHub organization name (platform stack only)

## Deploy GitHub OIDC roles

```sh
cd platform-infra
npm install
cp .env.example .env
# edit .env

export $(grep -v '^#' .env | xargs)
npm run deploy:platform
```

### Platform outputs

| IAM role | GitHub secret |
|----------|---------------|
| `company-idp-github-deploy-dev` | `AWS_ROLE_ARN` for dev |
| `company-idp-github-deploy-staging` | `AWS_ROLE_ARN` for staging |
| `company-idp-github-deploy-production` | `AWS_ROLE_ARN` for production |

## Deploy SonarQube

```sh
export AWS_REGION=ap-south-1
npm run deploy:sonarqube
```

Note the `sonarUrl` output and complete setup in [`docs/phase-3-sonarqube-setup.md`](../docs/phase-3-sonarqube-setup.md).

SonarQube stack:

- `sonarqube:lts-community` on ECS (2 vCPU / 4 GB)
- PostgreSQL 16 (`t4g.micro`)
- Public HTTP load balancer

## Notes

- Roles trust `repo:${GITHUB_ORG}/*:*`. Tighten per repository when ready.
- `AdministratorAccess` on deploy roles keeps SST bootstrap simple.
- If the GitHub OIDC provider already exists, import it or remove the duplicate resource before deploying.
- SonarQube must be reachable from GitHub Actions (public LB or self-hosted runners in the VPC).
