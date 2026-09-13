import type { SignInPageProps } from '@backstage/core-plugin-api';
import {
  configApiRef,
  githubAuthApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { SignInPageBlueprint } from '@backstage/plugin-app-react';
import { SignInPage } from '@backstage/core-components';

const githubProvider = {
  id: 'github-auth-provider',
  title: 'GitHub',
  message: 'Sign in with your company GitHub account',
  apiRef: githubAuthApiRef,
};

function CompanySignInPage(props: SignInPageProps) {
  const configApi = useApi(configApiRef);
  const environment =
    configApi.getOptionalString('auth.environment') ?? 'development';
  const providers =
    environment === 'production'
      ? [githubProvider]
      : ['guest' as const, githubProvider];

  return (
    <SignInPage
      {...props}
      title="Company IDP"
      align="center"
      providers={providers}
    />
  );
}

const companySignInPage = SignInPageBlueprint.make({
  name: 'company-sign-in',
  params: {
    loader: async () => (props: SignInPageProps) => (
      <CompanySignInPage {...props} />
    ),
  },
});

export const authModule = createFrontendModule({
  pluginId: 'app',
  extensions: [companySignInPage],
});
