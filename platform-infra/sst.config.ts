/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    const isSonarQube = input?.stage === 'sonarqube';

    return {
      name: isSonarQube ? 'company-idp-sonarqube' : 'company-idp-platform',
      removal: input?.stage === 'platform' ? 'retain' : 'remove',
      protect: input?.stage === 'platform',
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
      const { createSonarQubeStack } = await import('./lib/sonarqube-stack');
      return createSonarQubeStack();
    }

    const { createPlatformStack } = await import('./lib/platform-stack');
    return createPlatformStack();
  },
});
