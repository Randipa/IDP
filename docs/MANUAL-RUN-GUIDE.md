# Manual Run Guide — Company IDP

Step-by-step guide to run and verify the platform on your machine.

---

## Part A — Local Backstage (UI balanna — fastest)

Meke AWS, SonarQube, GitHub deploy **nathi**. Backstage portal eka browser eke balanna puluwan.

### Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Node.js | 22 or 24 | `node --version` |
| Yarn | 4.x | `yarn --version` |

Corepack enable karanna one nathnam:

```sh
corepack enable
```

### Step 1 — Project folder ekta yanna

```sh
cd /home/saliya/Pictures/IDP
```

### Step 2 — Dependencies install

```sh
yarn install
```

First time wadi wela minute 5–10 gatha wiya puluwan.

### Step 3 — Environment file (optional for basic UI)

Quick start walata `.env` **nathiwema** run wena puluwan. Scaffolder (new project create) use karanna nam `.env` one:

```sh
cp .env.example .env
```

`.env` file eke `GITHUB_TOKEN=` line eke token ekak danna (see Step 8 below).

### Step 4 — Backstage start

**Option 1 — Quick start (SQLite, Docker nathi)**

```sh
yarn start
```

**Option 2 — PostgreSQL (Docker one, data persist)**

```sh
cp app-config.local.yaml.example app-config.local.yaml
yarn db:up
yarn start
```

> Docker daemon run wela thiyenna one (`docker compose up -d`). Port **5433** use wenawa.

### Step 5 — Browser eke open karanna

Wait until terminal eke mehema pennne:

```text
webpack compiled successfully
Listening on :7007
```

Browser eke open karanna:

| URL | What |
|-----|------|
| **http://localhost:3000** | Backstage UI (main) |
| http://localhost:7007 | Backend API |

### Step 6 — UI eke verify karanna

1. **Catalog** — `company-idp`, `client-delivery`, reference services pennne
2. **Create** — `NestJS API Service` and `Next.js Fullstack Application` templates pennne
3. **Groups** — `engineering` → `platform`, `backend`, `frontend`
4. Entity ekak open kala — tabs: Overview, CI/CD (GitHub slug nathi nam empty), Code Quality, AWS

Guest login auto wenawa — sign-in page nathi.

### Step 7 — Stop karanna

Terminal eke `Ctrl + C`

PostgreSQL use kala nam:

```sh
yarn db:down
```

---

## Part B — GitHub Token (Scaffolder test karanna)

Template use kala new repo create karanna me token eka one.

### Step 8 — GitHub Personal Access Token

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens**
2. **Fine-grained** or **Classic** token create karanna
3. Permissions: **`repo`** (full repo access for private repos)
4. Token copy karanna

### Step 9 — `.env` update

```sh
# /home/saliya/Pictures/IDP/.env
GITHUB_TOKEN=ghp_your_token_here
```

### Step 10 — Backstage restart

```sh
yarn start
```

### Step 11 — Template test

1. **Create** → **NestJS API Service**
2. Fill: name, description, owner team, GitHub repo location, AWS region
3. **Create** — repo GitHub eke create wenawa + catalog eke register wenawa

> Me step eke real GitHub org access thiyenna one.

---

## Part C — AWS Platform (Optional — production path)

Me steps AWS account ekak thiyena welawata withrai. Local UI balanna Part A enough.

Order eka important:

| Order | What | Folder | Doc |
|-------|------|--------|-----|
| 1 | GitHub OIDC + deploy roles | `platform-infra/` | [phase-2](phase-2-github-aws-setup.md) |
| 2 | SonarQube on ECS | `platform-infra/` | [phase-3](phase-3-sonarqube-setup.md) |
| 3 | Backstage plugins config | repo root `.env` | [phase-4](phase-4-backstage-plugins.md) |
| 4 | IDP deploy to AWS | `idp-infra/` | [phase-5](phase-5-deploy-idp-to-aws.md) |

### C1 — Platform infra (OIDC roles)

```sh
cd /home/saliya/Pictures/IDP/platform-infra
npm install
cp .env.example .env
```

`.env` edit:

```env
GITHUB_ORG=your-github-org-name
AWS_REGION=ap-south-1
```

AWS CLI configured nam:

```sh
export $(grep -v '^#' .env | xargs)
npm run deploy:platform
```

Output: 3 IAM role ARNs save karanna (`dev`, `staging`, `production`).

### C2 — SonarQube (optional)

```sh
cd /home/saliya/Pictures/IDP/platform-infra
export AWS_REGION=ap-south-1
npm run deploy:sonarqube
```

Output `sonarUrl` copy karanna → `.env` eke:

```env
SONARQUBE_BASE_URL=http://your-sonarqube-url
SONARQUBE_EXTERNAL_URL=http://your-sonarqube-url
SONARQUBE_API_KEY=your-sonar-token
```

### C3 — IDP AWS deploy (optional)

```sh
cd /home/saliya/Pictures/IDP/idp-infra
npm install
cp .env.example .env
```

`.env` edit — `IDP_PUBLIC_URL` set karanna.

SST secrets (once per stage):

```sh
npx sst secret set GithubToken "ghp_..." --stage staging
npx sst secret set SonarApiKey "..." --stage staging
npx sst secret set BackendSecret "$(openssl rand -hex 32)" --stage staging
```

Deploy:

```sh
export $(grep -v '^#' .env | xargs)
npm run deploy:staging
```

Full details: [phase-5-deploy-idp-to-aws.md](phase-5-deploy-idp-to-aws.md)

---

## Troubleshooting (Local)

| Problem | Solution |
|---------|----------|
| `yarn install` fail | Node 22/24 install karanna; `corepack enable` |
| Port 3000 busy | Other app stop karanna or port change |
| Port 5433 busy | `docker-compose.yaml` eke port change karanna |
| Docker error | Docker Desktop / daemon start karanna |
| `GITHUB_TOKEN` error on Create | `.env` eke valid token danna, restart `yarn start` |
| Blank CI/CD tab | Normal — entity eke `github.com/project-slug` annotation nathi nam |
| SonarQube tab empty | Local walata SonarQube server nathi nam expected |

---

## Quick reference — daily dev commands

```sh
cd /home/saliya/Pictures/IDP
yarn install          # first time only
yarn start            # run portal
# browser → http://localhost:3000
```

---

## What to expect (screens)

```
Backstage home
├── Catalog          → systems, components, resources
├── Create           → NestJS + Next.js templates
├── Catalog entity
│   ├── Overview     → AWS card, about
│   ├── CI/CD        → GitHub Actions (needs annotation + token)
│   ├── Code Quality → SonarQube (needs server + token)
│   └── AWS          → SST stages, region
└── Settings         → user settings
```

Local test walata **Part A (Steps 1–6)** enough.
