# Reusable GitHub Actions Workflows

Central workflows consumed by scaffolded service repositories.

| Workflow | Purpose |
|----------|---------|
| [`reusable-quality.yml`](../../.github/workflows/reusable-quality.yml) | Lint, test, build |
| [`reusable-security.yml`](../../.github/workflows/reusable-security.yml) | Gitleaks + Trivy |
| [`reusable-deploy-sst.yml`](../../.github/workflows/reusable-deploy-sst.yml) | OIDC-based SST deploy |
| [`reusable-sonarqube.yml`](../../.github/workflows/reusable-sonarqube.yml) | SonarQube scan + optional quality gate |

## Usage in a service repository

```yaml
jobs:
  quality:
    uses: YOUR_ORG/company-idp/.github/workflows/reusable-quality.yml@main
    with:
      test-command: npm run test:cov

  security:
    uses: YOUR_ORG/company-idp/.github/workflows/reusable-security.yml@main

  sonarqube:
    uses: YOUR_ORG/company-idp/.github/workflows/reusable-sonarqube.yml@main
    with:
      test-command: npm run test:cov
      fail-on-quality-gate: false
    secrets:
      SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
      SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}

  deploy-dev:
    uses: YOUR_ORG/company-idp/.github/workflows/reusable-deploy-sst.yml@main
    with:
      stage: dev
      aws-region: ap-south-1
    secrets:
      AWS_ROLE_ARN: ${{ secrets.AWS_ROLE_ARN }}
```

Replace `YOUR_ORG/company-idp` with the GitHub slug of this IDP repository.

## GitHub environments

Recommended repository environments:

| Environment | Branch policy | Secret |
|-------------|---------------|--------|
| `dev` | `develop` | Role ARN for `company-idp-github-deploy-dev` |
| `staging` | `main` | Role ARN for `company-idp-github-deploy-staging` |
| `production` | manual | Role ARN for `company-idp-github-deploy-production` |

Additional analysis secrets (organization or repository scope):

| Secret | Purpose |
|--------|---------|
| `SONAR_HOST_URL` | Self-hosted SonarQube base URL |
| `SONAR_TOKEN` | Analysis token from SonarQube |

Deploy jobs should set `environment: dev|staging|production` when using environment-scoped secrets.

Generated service repos use a separate `deploy.yml` triggered by `workflow_run` after the `CI` workflow completes successfully, so SST deploy never runs when Gitleaks/Trivy or tests fail.
