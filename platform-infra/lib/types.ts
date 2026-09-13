export type PlatformOutputs = {
  githubOrg: string;
  githubOidcProviderArn: $util.Output<string>;
  githubOidcProviderAliasArn: $util.Output<string>;
  deployRoleArns: Record<string, $util.Output<string>>;
};

export type SonarQubeOutputs = {
  sonarUrl: $util.Output<string>;
  databaseHost: $util.Output<string>;
};
