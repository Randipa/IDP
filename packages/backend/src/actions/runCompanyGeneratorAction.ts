import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';

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
      const runnerPath = path.join(generatorRoot, 'run-once.cjs');

      if (!fs.existsSync(plopfilePath) || !fs.existsSync(runnerPath)) {
        throw new Error(
          `Plop generator not found at ${generatorRoot}. Ensure generators/company-dynamic is present.`,
        );
      }

      const requiredPartials = [
        'partials/ci/dependabot.production.yml.example',
        'partials/ci/deploy.yml.hbs',
        'partials/ci/ci.yml.hbs',
      ];
      for (const partial of requiredPartials) {
        const partialPath = path.join(generatorRoot, partial);
        if (!fs.existsSync(partialPath)) {
          throw new Error(`Plop generator partial missing: ${partialPath}`);
        }
      }

      ctx.logger.info(
        `Running company generator for ${ctx.input.name} in ${ctx.workspacePath}`,
      );

      const dataPath = path.join(ctx.workspacePath, '.plop-input.json');
      fs.writeFileSync(
        dataPath,
        JSON.stringify({ ...ctx.input, structure: 'monorepo' }),
      );

      try {
        execFileSync(process.execPath, [runnerPath, ctx.workspacePath, dataPath], {
          cwd: generatorRoot,
          stdio: 'pipe',
          timeout: 120_000,
          encoding: 'utf8',
        });
      } catch (error) {
        const execError = error as {
          stderr?: string;
          stdout?: string;
          message?: string;
        };
        const details =
          execError.stderr?.trim() ||
          execError.stdout?.trim() ||
          execError.message ||
          'unknown error';
        throw new Error(`Company generator failed: ${details}`);
      } finally {
        if (fs.existsSync(dataPath)) {
          fs.unlinkSync(dataPath);
        }
      }

      ctx.logger.info('Company generator completed successfully');

      const lockFilePath = path.join(ctx.workspacePath, 'package-lock.json');
      if (!fs.existsSync(lockFilePath)) {
        try {
          ctx.logger.info('Generating package-lock.json for CI');
          execFileSync(
            'npm',
            ['install', '--package-lock-only', '--ignore-scripts', '--no-audit'],
            {
              cwd: ctx.workspacePath,
              stdio: 'pipe',
              timeout: 120_000,
            },
          );
        } catch (error) {
          ctx.logger.warn(
            `Could not generate package-lock.json: ${
              error instanceof Error ? error.message : 'unknown error'
            }`,
          );
        }
      }
    },
  });
}
