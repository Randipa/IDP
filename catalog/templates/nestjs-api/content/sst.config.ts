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
    const vpc = new sst.aws.Vpc('Vpc', { nat: 'managed' });
    const cluster = new sst.aws.Cluster('Cluster', { vpc });

    new sst.aws.Service('Api', {
      cluster,
      loadBalancer: {
        ports: [{ listen: '80/http', forward: '3000/http' }],
        health: {
          '3000/http': {
            path: '/api/health',
            interval: '30 seconds',
          },
        },
      },
      dev: {
        command: 'npm run start:dev',
      },
      image: {
        context: '.',
        dockerfile: 'Dockerfile',
      },
      environment: {
        NODE_ENV: $app.stage,
        PORT: '3000',
      },
      scaling: {
        min: $app.stage === 'production' ? 2 : 1,
        max: $app.stage === 'production' ? 4 : 1,
      },
    });
  },
});
