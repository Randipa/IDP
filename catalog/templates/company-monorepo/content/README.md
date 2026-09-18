# ${{ values.name }}

${{ values.description }}

Company-standard monorepo layout:

```text
.
├── backend/              NestJS API (port 3000, prefix /api)
├── packages/
│   ├── client/           Next.js public app (port 3001)
│   └── admin/            React admin dashboard (port 3002)
├── sst.config.ts         AWS deployment (API + client + admin)
└── catalog-info.yaml     Backstage catalog registration
```

## Prerequisites

- Node.js 20+
- npm 10+
- Docker (for backend production image builds)

## Local development

Install dependencies from the repository root:

```sh
npm install
```

Run all apps together:

```sh
npm run dev
```

Or run individually:

| Command | App | URL |
|---------|-----|-----|
| `npm run dev:backend` | NestJS API | http://localhost:3000/api |
| `npm run dev:client` | Next.js client | http://localhost:3001 |
| `npm run dev:admin` | React admin | http://localhost:3002 |

## Testing

```sh
npm run test
npm run test:cov
```

## Deployment

Requires AWS credentials and SST bootstrap:

```sh
npm run deploy:dev
npm run deploy:staging
npm run deploy:prod
```

CI/CD uses reusable workflows from the Company IDP repository.
