# Software Catalog

Entity definitions for the Company Internal Developer Platform.

## Layout

| Path | Entity kinds | Purpose |
|------|--------------|---------|
| `org/groups.yaml` | Group | Engineering, platform, backend, and frontend teams |
| `org/users.yaml` | User | Team leads and catalog owners |
| `systems.yaml` | Domain, System | IDP and client delivery systems |
| `resources.yaml` | Resource | AWS account, GitHub org, SonarQube |
| `components/reference-services.yaml` | Component | Reference NestJS and Next.js architectures |
| `templates/nestjs-api/template.yaml` | Template | NestJS API golden-path scaffolder |
| `templates/nextjs-fullstack/template.yaml` | Template | Next.js fullstack golden-path scaffolder |

## Conventions

- **Owners** use `group:default/<team-name>` references.
- **New client projects** should register a `catalog-info.yaml` in their repo and link to the `client-delivery` system.
- **Software templates** live under `catalog/templates/` (NestJS API and Next.js fullstack).

## Adding a New Service

1. Add `catalog-info.yaml` to the service repository.
2. Set `spec.system` to `client-delivery` (or a dedicated client system later).
3. Set `spec.owner` to the responsible team group.
4. Register the repo location in `app-config.yaml` or via GitHub discovery.
