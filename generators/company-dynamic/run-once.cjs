'use strict';

const fs = require('fs');
const path = require('path');

async function main() {
  const destBasePath = process.argv[2];
  const dataPath = process.argv[3];

  if (!destBasePath || !dataPath) {
    throw new Error('Usage: node run-once.cjs <destBasePath> <dataJsonPath>');
  }

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const generatorRoot = __dirname;
  const repoRoot = path.resolve(generatorRoot, '../..');
  const nodePlopPath = require.resolve('node-plop', {
    paths: [
      path.join(repoRoot, 'packages/backend'),
      path.join(repoRoot, 'node_modules'),
    ],
  });
  const nodePlopModule = require(nodePlopPath);
  const nodePlop = nodePlopModule.default ?? nodePlopModule;

  const plop = await nodePlop(path.join(generatorRoot, 'plopfile.cjs'), {
    destBasePath,
  });
  const generator = plop.getGenerator('company-project');
  const result = await generator.runActions(data);
  const failures = result.failures ?? [];

  if (failures.length > 0) {
    process.stderr.write(
      failures
        .map(failure => `${failure.type}: ${failure.error ?? 'unknown error'}`)
        .join('; '),
    );
    process.exit(1);
  }
}

main().catch(error => {
  process.stderr.write(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
