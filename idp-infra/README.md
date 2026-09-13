# IDP AWS deployment (SST)

Deploys the Backstage portal to ECS Fargate with RDS PostgreSQL.

## Prerequisites

- Phase 2 platform IAM roles (or another OIDC role with deploy permissions)
- Docker available locally for image build (or use CI)
- Node.js 22+ and Yarn 4 at repo root
- Public URL decided before first deploy (`IDP_PUBLIC_URL`)

## One-time SST secrets

From `idp-infra/` after `npm install`:

```sh
npx sst secret set GithubToken "ghp_..." --stage staging
npx sst secret set SonarApiKey "..." --stage staging
npx sst secret set BackendSecret "$(openssl rand -hex 32)" --stage staging
```

Repeat for `dev` and `production` stages as needed.

## Deploy locally

```sh
cd idp-infra
npm install
cp .env.example .env
# edit .env

export $(grep -v '^#' .env | xargs)
npm run deploy:staging
```

The `prepare` script runs `yarn build:backend` automatically before SST deploy.

## Outputs

| Output | Description |
|--------|-------------|
| `url` | Load balancer URL (use for DNS or first-time verification) |
| `configuredPublicUrl` | Value passed as `IDP_PUBLIC_URL` |
| `databaseHost` | RDS endpoint |

Point your DNS (e.g. `idp.company.com`) to the load balancer, then set `IDP_PUBLIC_URL` to the final HTTPS URL and redeploy.

## Stages

| Stage | Intended use |
|-------|----------------|
| `dev` | Internal testing |
| `staging` | Pre-production validation |
| `production` | Team-wide IDP |

## GitHub OAuth (recommended)

Create a GitHub OAuth App with callback:

```text
https://<IDP_PUBLIC_URL>/api/auth/github/handler/frame
```

Set `AUTH_GITHUB_CLIENT_ID` and `AUTH_GITHUB_CLIENT_SECRET` in `.env` before deploy.

See [`docs/phase-5-deploy-idp-to-aws.md`](../docs/phase-5-deploy-idp-to-aws.md) for the full runbook.
