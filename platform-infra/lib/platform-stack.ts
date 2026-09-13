import type { PlatformOutputs } from './types';

const DEPLOY_STAGES = ['dev', 'staging', 'production'] as const;

export async function createPlatformStack(): Promise<PlatformOutputs> {
  const githubOrg = process.env.GITHUB_ORG;
  const githubRepo = process.env.GITHUB_REPO;

  if (!githubOrg) {
    throw new Error(
      'GITHUB_ORG is required. Example: GITHUB_ORG=Randipa npm run deploy:platform',
    );
  }

  if (!githubRepo) {
    throw new Error(
      'GITHUB_REPO is required. Example: GITHUB_REPO=IDP npm run deploy:platform',
    );
  }

  const accountId = aws.getCallerIdentityOutput({}).accountId;
  const oidcProviderArn = accountId.apply(
    id =>
      `arn:aws:iam::${id}:oidc-provider/token.actions.githubusercontent.com`,
  );

  const deployRoles: Record<string, $util.Output<string>> = {};

  for (const stage of DEPLOY_STAGES) {
    const role = new aws.iam.Role(`GitHubDeploy${stage}`, {
      name: `company-idp-github-deploy-${stage}`,
      description: `GitHub Actions deploy role for SST stage "${stage}"`,
      assumeRolePolicy: $interpolate`{
        "Version": "2012-10-17",
        "Statement": [
          {
            "Effect": "Allow",
            "Principal": {
              "Federated": "${oidcProviderArn}"
            },
            "Action": "sts:AssumeRoleWithWebIdentity",
            "Condition": {
              "StringEquals": {
                "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
              },
              "StringLike": {
                "token.actions.githubusercontent.com:sub": [
                  "repo:${githubOrg}/${githubRepo}:*",
                  "repo:${githubOrg}/*",
                  "repo:${githubOrg}@*/${githubRepo}@*:*",
                  "repo:${githubOrg}@*/*"
                ]
              }
            }
          }
        ]
      }`,
    });

    new aws.iam.RolePolicyAttachment(`GitHubDeploy${stage}Policy`, {
      role: role.name,
      policyArn: 'arn:aws:iam::aws:policy/AdministratorAccess',
    });

    deployRoles[stage] = role.arn;
  }

  return {
    githubOrg,
    githubRepo,
    githubOidcProviderArn: oidcProviderArn,
    deployRoleArns: deployRoles,
  };
}
