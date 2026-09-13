import type { SonarQubeOutputs } from './types';

export async function createSonarQubeStack(): Promise<SonarQubeOutputs> {
  const vpc = new sst.aws.Vpc('SonarQubeVpc', { nat: 'managed' });

  const database = new sst.aws.Postgres('SonarQubeDb', {
    vpc,
    version: '16.4',
    instance: 't4g.micro',
    storage: '20 GB',
    transform: {
      instance: {
        backupRetentionPeriod: 0,
        performanceInsightsEnabled: false,
      },
    },
  });

  const cluster = new sst.aws.Cluster('SonarQubeCluster', { vpc });

  const service = new sst.aws.Service('SonarQube', {
    cluster,
    cpu: '2 vCPU',
    memory: '4 GB',
    loadBalancer: {
      ports: [{ listen: '80/http', forward: '9000/http' }],
      health: {
        '9000/http': {
          path: '/api/system/status',
          interval: '30 seconds',
        },
      },
    },
    image: 'sonarqube:lts-community',
    environment: {
      SONAR_JDBC_URL: $interpolate`jdbc:postgresql://${database.host}:${database.port}/${database.database}`,
      SONAR_JDBC_USERNAME: database.username,
      SONAR_JDBC_PASSWORD: database.password,
      SONAR_ES_BOOTSTRAP_CHECKS_DISABLE: 'true',
    },
    scaling: {
      min: 1,
      max: 1,
    },
  });

  return {
    sonarUrl: service.url,
    databaseHost: database.host,
  };
}
