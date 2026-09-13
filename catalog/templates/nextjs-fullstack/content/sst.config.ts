/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: '${{ values.name }}',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      protect: input?.stage === 'production',
      home: 'aws',
      providers: {
        aws: {
          region: '${{ values.awsRegion }}',
        },
      },
    };
  },
  async run() {
    new sst.aws.Nextjs('Web', {
      path: '.',
      environment: {
        APP_NAME: '${{ values.name }}',
        APP_STAGE: $app.stage,
      },
    });
  },
});
