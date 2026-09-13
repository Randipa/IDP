# Phase 4 — Backstage Plugins (GitHub, AWS, SonarQube)

Integrates deployment and quality tooling into entity pages inside Backstage.

## Installed plugins

| Plugin | Entity tab / card | Requires |
|--------|-------------------|----------|
| GitHub Actions | **CI/CD** tab + workflow cards | `github.com/project-slug` annotation + `GITHUB_TOKEN` |
| SonarQube | **Code Quality** tab + summary card | `sonarqube.org/project-key` + SonarQube API key |
| AWS (custom) | **AWS** tab + overview card | `company.io/aws-region` annotation |

## Configure Backstage

Add to `.env` (see `.env.example`):

| Variable | Purpose |
|----------|---------|
| `GITHUB_TOKEN` | GitHub integration for Actions and scaffolder |
| `SONARQUBE_BASE_URL` | SonarQube URL reachable from Backstage backend |
| `SONARQUBE_EXTERNAL_URL` | URL opened in the browser (usually the same) |
| `SONARQUBE_API_KEY` | SonarQube user token with browse permissions |

Restart Backstage after updating secrets:

```sh
yarn start
```

## Entity annotations (auto-added by templates)

```yaml
metadata:
  annotations:
    github.com/project-slug: org/repo
    sonarqube.org/project-key: service-name
    company.io/aws-region: ap-south-1
    company.io/sst-stages: dev,staging,production
```

## What you should see

Open any scaffolded **Component** in the catalog:

1. **Overview** — AWS deployment summary card (region + SST stages)
2. **CI/CD** — recent GitHub Actions workflow runs
3. **Code Quality** — SonarQube ratings, coverage, issues
4. **AWS** — deployment model and console links

## Troubleshooting

| Issue | Fix |
|-------|-----|
| CI/CD tab missing | Add `github.com/project-slug` annotation and valid `GITHUB_TOKEN` |
| SonarQube tab empty | Confirm project key matches SonarQube project; run at least one CI scan |
| SonarQube API errors | Verify `SONARQUBE_BASE_URL` is reachable from the Backstage backend host |
| AWS tab missing | Add `company.io/aws-region` or `github.com/project-slug` annotation |

## Next phase

Phase 5 deploys the Backstage IDP itself to AWS for team-wide access.
