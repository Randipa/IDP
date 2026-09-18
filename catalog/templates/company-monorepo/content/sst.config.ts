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

    const api = new sst.aws.Service('Api', {
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
        directory: 'backend',
      },
      image: {
        context: 'backend',
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

    new sst.aws.Nextjs('Client', {
      path: 'packages/client',
      environment: {
        NEXT_PUBLIC_API_URL: api.url,
        APP_NAME: '${{ values.name }}',
        APP_STAGE: $app.stage,
      },
    });

    new sst.aws.StaticSite('Admin', {
      path: 'packages/admin',
      build: {
        command: 'npm run build',
        output: 'dist',
      },
      environment: {
        VITE_APP_NAME: '${{ values.name }}',
        VITE_API_URL: api.url,
      },
    });
  },
});
