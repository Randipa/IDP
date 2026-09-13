/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'company-idp',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      protect: input?.stage === 'production',
      home: 'aws',
      providers: {
        aws: {
          region: process.env.AWS_REGION ?? 'ap-south-1',
        },
      },
    };
  },
  async run() {
    const publicUrl = process.env.IDP_PUBLIC_URL;

    if (!publicUrl) {
      throw new Error(
        'IDP_PUBLIC_URL is required. Example: IDP_PUBLIC_URL=https://idp.company.com npm run deploy:staging',
      );
    }

    const isProduction = $app.stage === 'production';

    const vpc = new sst.aws.Vpc('IdpVpc', { nat: 'managed' });

    const database = new sst.aws.Postgres('IdpDb', {
      vpc,
      version: '16.9',
      instance: isProduction ? 't4g.small' : 't4g.micro',
      storage: '20 GB',
      transform: {
        instance: {
          backupRetentionPeriod: isProduction ? 7 : 0,
          performanceInsightsEnabled: isProduction,
        },
      },
    });

    const cluster = new sst.aws.Cluster('IdpCluster', { vpc });

    const githubToken = new sst.Secret('GithubToken');
    const sonarApiKey = new sst.Secret('SonarApiKey');
    const backendSecret = new sst.Secret('BackendSecret');

    const service = new sst.aws.Service('Backstage', {
      cluster,
      cpu: $app.stage === 'production' ? '2 vCPU' : '1 vCPU',
      memory: $app.stage === 'production' ? '4 GB' : '2 GB',
      loadBalancer: {
        ports: [{ listen: '80/http', forward: '7007/http' }],
        health: {
          '7007/http': {
            path: '/healthcheck',
            interval: '30 seconds',
          },
        },
      },
      image: {
        context: '..',
        dockerfile: 'packages/backend/Dockerfile',
      },
      environment: {
        NODE_ENV: 'production',
        IDP_PUBLIC_URL: publicUrl,
        APP_CONFIG_app_baseUrl: publicUrl,
        APP_CONFIG_backend_baseUrl: publicUrl,
        APP_CONFIG_backend_cors_origin: publicUrl,
        APP_CONFIG_auth_providers_guest_dangerouslyAllowOutsideDevelopment: 'true',
        POSTGRES_HOST: database.host,
        POSTGRES_PORT: $interpolate`${database.port}`,
        POSTGRES_USER: database.username,
        POSTGRES_PASSWORD: database.password,
        POSTGRES_DB: database.database,
        GITHUB_TOKEN: githubToken.value,
        SONARQUBE_BASE_URL:
          process.env.SONARQUBE_BASE_URL || 'http://127.0.0.1:9000',
        SONARQUBE_EXTERNAL_URL:
          process.env.SONARQUBE_EXTERNAL_URL ||
          process.env.SONARQUBE_BASE_URL ||
          'http://127.0.0.1:9000',
        SONARQUBE_API_KEY: sonarApiKey.value,
        BACKEND_SECRET: backendSecret.value,
        AUTH_GITHUB_CLIENT_ID: process.env.AUTH_GITHUB_CLIENT_ID ?? '',
        AUTH_GITHUB_CLIENT_SECRET: process.env.AUTH_GITHUB_CLIENT_SECRET ?? '',
      },
      scaling: {
        min: $app.stage === 'production' ? 2 : 1,
        max: $app.stage === 'production' ? 3 : 1,
      },
    });

    return {
      url: service.url,
      configuredPublicUrl: publicUrl,
      databaseHost: database.host,
      stage: $app.stage,
    };
  },
});
