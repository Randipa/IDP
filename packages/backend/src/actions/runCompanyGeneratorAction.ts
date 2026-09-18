import fs from 'fs';
import path from 'path';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import nodePlopImport from 'node-plop';

const nodePlop = nodePlopImport as unknown as (
  filepath: string,
  options?: { destBasePath?: string },
) => Promise<{
  getGenerator: (name: string) => {
    runActions: (data: Record<string, unknown>) => Promise<{
      failures?: Array<{ type?: string; error?: string }>;
    }>;
  };
}>;

function findRepoRoot(startDir: string): string {
  let current = startDir;
  while (current !== path.dirname(current)) {
    if (fs.existsSync(path.join(current, 'app-config.yaml'))) {
      return current;
    }
    current = path.dirname(current);
  }
  return startDir;
}

export function createRunCompanyGeneratorAction() {
  return createTemplateAction({
    id: 'company:run-generator',
    description:
      'Assembles a company project skeleton from selected options using the Plop generator',
    schema: {
      input: z =>
        z.object({
          name: z.string({ description: 'Project name' }),
          description: z.string({ description: 'Project description' }),
          owner: z.string({ description: 'Catalog owner entity ref' }),
          awsRegion: z.string({ description: 'AWS region for SST deployment' }),
          githubOrg: z.string({ description: 'GitHub organization or user' }),
          githubRepo: z.string({ description: 'GitHub repository name' }),
          idpRepo: z.string({ description: 'Company IDP repo slug for CI reuse' }),
          idpRef: z.string({ description: 'Company IDP git ref for CI reuse' }),
          backendFramework: z.enum(['nestjs', 'express'], {
            description: 'Backend framework to generate',
          }),
          includeClient: z.boolean({
            description: 'Whether to generate a client frontend app',
          }),
          clientFramework: z.enum(['nextjs', 'react-vite', 'none'], {
            description: 'Client frontend framework',
          }),
          includeAdmin: z.boolean({
            description: 'Whether to generate an admin dashboard app',
          }),
          backendDir: z
            .string({ description: 'Backend service folder name' })
            .optional()
            .default('backend'),
          frontendDir: z
            .string({ description: 'Root folder for all frontend apps' })
            .optional()
            .default('frontend'),
          packagesDir: z
            .string({ description: 'Subfolder inside frontend that holds client and admin' })
            .optional()
            .default('packages'),
          clientDir: z
            .string({ description: 'Client app folder name' })
            .optional()
            .default('client'),
          adminDir: z
            .string({ description: 'Admin app folder name' })
            .optional()
            .default('admin'),
        }),
    },
    async handler(ctx) {
      const repoRoot = findRepoRoot(process.cwd());
      const generatorRoot = path.join(repoRoot, 'generators/company-dynamic');
      const plopfilePath = path.join(generatorRoot, 'plopfile.cjs');

      if (!fs.existsSync(plopfilePath)) {
        throw new Error(
          `Plop generator not found at ${plopfilePath}. Ensure generators/company-dynamic is present.`,
        );
      }

      ctx.logger.info(
        `Running company generator for ${ctx.input.name} in ${ctx.workspacePath}`,
      );

      const plop = await nodePlop(plopfilePath, {
        destBasePath: ctx.workspacePath,
      });
      const generator = plop.getGenerator('company-project');

      const result = await generator.runActions({
        ...ctx.input,
        structure: 'monorepo',
      });

      const failures = result.failures ?? [];
      if (failures.length > 0) {
        const messages = failures
          .map(failure => `${failure.type}: ${failure.error ?? 'unknown error'}`)
          .join('; ');
        throw new Error(`Company generator failed: ${messages}`);
      }

      ctx.logger.info('Company generator completed successfully');
    },
  });
}
