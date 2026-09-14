# Deploy an Existing Next.js Project via Company IDP

Use this when you **already have** a Next.js app and want AWS deploy (dev / staging / prod) through the IDP pipeline.

---

## Before you start (one-time platform setup)

| # | Task | Status |
|---|------|--------|
| 1 | `platform-infra` deploy — GitHub OIDC + IAM roles | Required |
| 2 | IDP repo on GitHub (e.g. `YOUR_ORG/company-idp`) with reusable workflows | Required |
| 3 | SonarQube deployed + tokens (optional for staging, required for prod gate) | Recommended |
| 4 | Next.js project in a **GitHub repository** | Required |

If step 1 not done yet → [phase-2-github-aws-setup.md](phase-2-github-aws-setup.md)

---

## Step 1 — Add SST to your Next.js project

Project **root** eke (where `package.json` and `next.config` thiyenne):

### 1.1 Install SST

```sh
cd /path/to/your-nextjs-project
npm install -D sst@^3.4.0
```

### 1.2 `sst.config.ts` create karanna

Replace `my-nextjs-app` with your app name. Replace region if needed.

```ts
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'my-nextjs-app',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      protect: input?.stage === 'production',
      home: 'aws',
      providers: {
        aws: {
          region: 'ap-south-1',
        },
      },
    };
  },
  async run() {
    new sst.aws.Nextjs('Web', {
      path: '.',
      environment: {
        APP_STAGE: $app.stage,
      },
    });
  },
});
```

### 1.3 `package.json` scripts add karanna

```json
{
  "scripts": {
    "deploy:dev": "sst deploy --stage dev",
    "deploy:staging": "sst deploy --stage staging",
    "deploy:prod": "sst deploy --stage production"
  }
}
```

### 1.4 Local test (optional)

AWS credentials configured nam:

```sh
npx sst deploy --stage dev
```

---

## Step 2 — Add CI/CD workflow

`.github/workflows/ci.yml` create karanna.

Replace:

- `YOUR_ORG/company-idp` → your IDP GitHub repo
- `ap-south-1` → your AWS region

```yaml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  workflow_dispatch:
    inputs:
      stage:
        required: true
        default: production
        type: choice
        options: [dev, staging, production]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  quality:
    uses: YOUR_ORG/company-idp/.github/workflows/reusable-quality.yml@main
    with:
      test-command: npm run test

  security:
    uses: YOUR_ORG/company-idp/.github/workflows/reusable-security.yml@main

  sonarqube:
    uses: YOUR_ORG/company-idp/.github/workflows/reusable-sonarqube.yml@main
    with:
      test-command: npm run test
      fail-on-quality-gate: ${{ github.event_name == 'workflow_dispatch' && github.event.inputs.stage == 'production' }}
    secrets:
      SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
      SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}

  deploy-dev:
    needs: [quality, security]
    if: github.event_name == 'push' && github.ref_name == 'develop'
    uses: YOUR_ORG/company-idp/.github/workflows/reusable-deploy-sst.yml@main
    with:
      stage: dev
      aws-region: ap-south-1
    secrets:
      AWS_ROLE_ARN: ${{ secrets.AWS_ROLE_ARN }}

  deploy-staging:
    needs: [quality, security, sonarqube]
    if: github.event_name == 'push' && github.ref_name == 'main'
    uses: YOUR_ORG/company-idp/.github/workflows/reusable-deploy-sst.yml@main
    with:
      stage: staging
      aws-region: ap-south-1
    secrets:
      AWS_ROLE_ARN: ${{ secrets.AWS_ROLE_ARN }}

  deploy-production:
    needs: [quality, security, sonarqube]
    if: github.event_name == 'workflow_dispatch' && github.event.inputs.stage == 'production'
    uses: YOUR_ORG/company-idp/.github/workflows/reusable-deploy-sst.yml@main
    with:
      stage: production
      aws-region: ap-south-1
    secrets:
      AWS_ROLE_ARN: ${{ secrets.AWS_ROLE_ARN }}
```

> `npm run test` nathi nam quality job eke `npm run build` only use karanna — reusable workflow edit karanna puluwan.

---

## Step 3 — SonarQube config (recommended)

### 3.1 `sonar-project.properties` (project root)

Replace `my-nextjs-app` with your service name (GitHub repo name wla match karanna easy):

```properties
sonar.projectKey=my-nextjs-app
sonar.projectName=my-nextjs-app
sonar.sourceEncoding=UTF-8
sonar.sources=app,src,lib,pages
sonar.exclusions=**/node_modules/**,**/.next/**
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.qualitygate.wait=true
```

Folder structure ekata anuwa `sonar.sources` adjust karanna (App Router → `app`, Pages Router → `pages`).

---

## Step 4 — Backstage catalog file

Project root eke `catalog-info.yaml`:

Replace values with yours:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-nextjs-app
  title: My Next.js App
  description: Client Next.js application
  tags:
    - nextjs
    - aws
    - sst
  annotations:
    github.com/project-slug: YOUR_ORG/my-nextjs-app
    sonarqube.org/project-key: my-nextjs-app
    company.io/aws-region: ap-south-1
    company.io/sst-stages: dev,staging,production
spec:
  type: website
  lifecycle: experimental
  owner: group:default/frontend
  system: client-delivery
```

Backstage eke pennanna nam me file eka commit karanna. IDP catalog auto-ingest karanna location ekak add karanna puluwan (Step 7).

---

## Step 5 — GitHub repository secrets

Repo → **Settings** → **Secrets and variables** → **Actions**

| Secret | Value |
|--------|-------|
| `AWS_ROLE_ARN` | `platform-infra` deploy output — `company-idp-github-deploy-dev` (dev walata) |
| `SONAR_HOST_URL` | SonarQube URL |
| `SONAR_TOKEN` | SonarQube analysis token |

**Staging / production** walata different role ARNs use karanna one nam GitHub **Environments** (`dev`, `staging`, `production`) create kala environment-scoped secrets danna.

Role ARNs from:

```sh
cd platform-infra
npm run deploy:platform
# save deployRoleArns.dev / staging / production
```

---

## Step 6 — Branches create karanna

```sh
git checkout -b develop
git push -u origin develop
git checkout main   # or master
```

| Branch | Auto deploy stage |
|--------|-------------------|
| `develop` | **dev** |
| `main` | **staging** |
| Manual workflow dispatch | **production** |

---

## Step 7 — Push and deploy

```sh
git add sst.config.ts package.json .github catalog-info.yaml sonar-project.properties
git commit -m "chore: add IDP SST deploy pipeline"
git push origin develop
```

GitHub → **Actions** tab eke workflow run balanna.

1. `develop` push → quality + security → **dev** deploy
2. `main` merge → **staging** deploy
3. **Actions** → **Run workflow** → stage `production` → prod deploy (SonarQube gate pass wenna one)

---

## Step 8 — Backstage eke register karanna (optional)

### Option A — Register Existing Component (UI)

1. **Create** → **Register Existing Component** (or open `/catalog-import`)
2. URL eka **exactly** me format walata danna:

```
https://github.com/Randipa/IDPWebTest/blob/main/catalog-info.yaml
```

Repo root URL (`https://github.com/Randipa/IDPWebTest`) puluwan — namut repo eke root eke `catalog-info.yaml` thiyenna one.

3. **Analyze** → preview balanna → last step eke **Import** click karanna (**Analyze mattam click karanna epa**)
4. **Catalog** refresh karala balanna — **Backlog Web Application** pennne

**Common mistakes**

| Mistake | Result |
|---------|--------|
| `Randipa/backlog` repo URL | Repo **exist ne** — register fail |
| Analyze only, no **Import** click | Catalog eke add wenne ne |
| Private repo + no `GITHUB_TOKEN` | Fetch fail |
| Wrong branch (`main` vs `master`) | 404 |

**Important:** `IDPWebTest` repo eke `catalog-info.yaml` thiyenawa, namut `github.com/project-slug` annotation eke `Randipa/backlog` kiyala thiyenawa — eka **`Randipa/IDPWebTest`** kiyala fix karanna (CI/CD tab ekata).

### Option B — IDP config eke location add karanna (platform team)

`app-config.production.yaml`:

```yaml
catalog:
  locations:
    - type: url
      target: https://github.com/Randipa/IDPWebTest/blob/main/catalog-info.yaml
```

Redeploy IDP → component auto-ingest wenawa.

### Option C — Backstage Create template

Greenfield project nam **Create** → **Next.js Fullstack Application** use karanna puluwan — me guide existing project walata.

---

## Deploy flow summary

```
Code push (develop)
    → lint / test / build
    → Gitleaks + Trivy
    → sst deploy --stage dev

Merge to main
    → + SonarQube scan
    → sst deploy --stage staging

Manual production dispatch
    → SonarQube quality gate MUST pass
    → sst deploy --stage production
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Not authorized to perform sts:AssumeRoleWithWebIdentity` | Repo IDP `GITHUB_ORG` eke thiyenna one; OIDC deploy karala thiyenna one |
| Reusable workflow not found | IDP repo public/org-accessible; `YOUR_ORG/company-idp@main` correct nam check karanna |
| SST build fail | Next.js project root eke `sst.config.ts` thiyenna one; `npm run build` local pass wena check karanna |
| SonarQube fails | `sonar-project.properties` paths + `SONAR_*` secrets check karanna |
| Prod deploy blocked | SonarQube quality gate pass karanna; manual dispatch use karanna |

---

## Reference files in IDP repo

Copy from template if needed:

- `catalog/templates/nextjs-fullstack/content/sst.config.ts`
- `catalog/templates/nextjs-fullstack/content/.github/workflows/ci.yml`
- `catalog/templates/nextjs-fullstack/content/catalog-info.yaml`
- `catalog/templates/nextjs-fullstack/content/sonar-project.properties`
