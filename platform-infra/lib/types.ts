export type PlatformOutputs = {
  githubOrg: string;
  githubOidcProviderArn: $util.Output<string>;
  deployRoleArns: Record<string, $util.Output<string>>;
};
