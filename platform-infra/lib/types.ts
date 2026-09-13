export type PlatformOutputs = {
  githubOrg: string;
  githubRepo: string;
  githubOidcProviderArn: $util.Output<string>;
  deployRoleArns: Record<string, $util.Output<string>>;
};
