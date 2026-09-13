/// <reference path="./.sst/platform/config.d.ts" />

import { createPlatformStack } from './lib/platform-stack';
import { createSonarQubeStack } from './lib/sonarqube-stack';

export default $config({
  app(input) {
    const isSonarQube = input?.stage === 'sonarqube';

    return {
      name: isSonarQube ? 'company-idp-sonarqube' : 'company-idp-platform',
      removal: input?.stage === 'platform' || isSonarQube ? 'retain' : 'remove',
      protect: input?.stage === 'platform' || isSonarQube,
      home: 'aws',
      providers: {
        aws: {
          region: process.env.AWS_REGION ?? 'ap-south-1',
        },
      },
    };
  },
  async run() {
    if ($app.stage === 'sonarqube') {
      return createSonarQubeStack();
    }

    return createPlatformStack();
  },
});
