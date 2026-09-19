'use strict';

const Handlebars = require('handlebars');

function sanitizeFolderName(value, fallback) {
  const cleaned = String(value ?? fallback)
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .filter(part => part && part !== '.' && part !== '..')
    .join('/');

  if (!cleaned || !/^[a-z][a-z0-9-]*$/i.test(cleaned.split('/').pop() ?? '')) {
    return fallback;
  }

  return cleaned;
}

function prepareFolderLayout(data) {
  const backendDir = sanitizeFolderName(data.backendDir, 'backend');
  const frontendDir = sanitizeFolderName(data.frontendDir, 'frontend');
  const packagesDir = sanitizeFolderName(data.packagesDir, 'packages');
  const clientDir = sanitizeFolderName(data.clientDir, 'client');
  const adminDir = sanitizeFolderName(data.adminDir, 'admin');
  const appsBasePath = `${frontendDir}/${packagesDir}`;

  return {
    ...data,
    backendDir,
    frontendDir,
    packagesDir,
    clientDir,
    adminDir,
    appsBasePath,
    clientPath: `${appsBasePath}/${clientDir}`,
    adminPath: `${appsBasePath}/${adminDir}`,
    backendPackageName: backendDir,
    clientPackageName: clientDir,
    adminPackageName: adminDir,
  };
}

module.exports = function plopfile(plop) {
  plop.setHelper('eq', (a, b) => a === b);
  plop.setHelper('and', (a, b) => a && b);
  plop.setHelper('or', (a, b) => a || b);
  plop.setHelper('gha', expr => new Handlebars.SafeString(`\${{ ${expr} }}`));

  plop.setGenerator('company-project', {
    description:
      'Assemble a company monorepo from backend/client/admin options',
    prompts: [],
    actions: data => {
      const layout = prepareFolderLayout(data);
      const actions = [
        {
          type: 'add',
          path: 'package.json',
          templateFile: 'partials/root/package.json.hbs',
          data: layout,
        },
        {
          type: 'add',
          path: 'README.md',
          templateFile: 'partials/root/README.md.hbs',
          data: layout,
        },
        {
          type: 'add',
          path: 'catalog-info.yaml',
          templateFile: 'partials/root/catalog-info.yaml.hbs',
          data: layout,
        },
        {
          type: 'add',
          path: 'sst.config.ts',
          templateFile: 'partials/root/sst.config.ts.hbs',
          data: layout,
        },
        {
          type: 'add',
          path: 'sonar-project.properties',
          templateFile: 'partials/root/sonar-project.properties.hbs',
          data: layout,
        },
        {
          type: 'add',
          path: '.gitignore',
          templateFile: 'partials/root/gitignore.hbs',
          data: layout,
        },
        {
          type: 'add',
          path: '.github/workflows/ci.yml',
          templateFile: 'partials/ci/ci.yml.hbs',
          data: layout,
        },
        {
          type: 'add',
          path: '.github/workflows/ci-extended.yml.example',
          templateFile: 'partials/ci/ci-extended.yml.example.hbs',
          data: layout,
        },
        {
          type: 'add',
          path: '.github/dependabot.production.yml.example',
          templateFile: 'partials/ci/dependabot.production.yml.example',
          data: layout,
        },
        {
          type: 'add',
          path: '.github/workflows/deploy.yml',
          templateFile: 'partials/ci/deploy.yml.hbs',
          data: layout,
        },
      ];

      if (layout.backendFramework === 'nestjs') {
        actions.push({
          type: 'addMany',
          destination: layout.backendDir,
          base: 'partials/backend-nestjs',
          templateFiles: 'partials/backend-nestjs/**',
          globOptions: { dot: true },
          data: layout,
        });
      }

      if (layout.backendFramework === 'express') {
        actions.push({
          type: 'addMany',
          destination: layout.backendDir,
          base: 'partials/backend-express',
          templateFiles: 'partials/backend-express/**',
          globOptions: { dot: true },
          data: layout,
        });
      }

      if (layout.includeClient && layout.clientFramework === 'nextjs') {
        actions.push({
          type: 'addMany',
          destination: layout.clientPath,
          base: 'partials/client-nextjs',
          templateFiles: 'partials/client-nextjs/**',
          globOptions: { dot: true },
          data: layout,
        });
      }

      if (layout.includeClient && layout.clientFramework === 'react-vite') {
        actions.push({
          type: 'addMany',
          destination: layout.clientPath,
          base: 'partials/client-react-vite',
          templateFiles: 'partials/client-react-vite/**',
          globOptions: { dot: true },
          data: layout,
        });
      }

      if (layout.includeAdmin) {
        actions.push({
          type: 'addMany',
          destination: layout.adminPath,
          base: 'partials/admin-react',
          templateFiles: 'partials/admin-react/**',
          globOptions: { dot: true },
          data: layout,
        });
      }

      return actions;
    },
  });
};
