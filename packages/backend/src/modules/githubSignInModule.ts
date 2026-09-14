import { createBackendModule } from '@backstage/backend-plugin-api';
import { githubAuthenticator } from '@backstage/plugin-auth-backend-module-github-provider';
import {
  authProvidersExtensionPoint,
  createOAuthProviderFactory,
} from '@backstage/plugin-auth-node';

export default createBackendModule({
  pluginId: 'auth',
  moduleId: 'github-signin',
  register(env) {
    env.registerInit({
      deps: { providers: authProvidersExtensionPoint },
      async init({ providers }) {
        providers.registerProvider({
          providerId: 'github',
          factory: createOAuthProviderFactory({
            authenticator: githubAuthenticator,
            async signInResolver(info, ctx) {
              const username = info.result.fullProfile.username;
              if (!username) {
                throw new Error('GitHub profile did not contain a username');
              }

              return ctx.signInWithCatalogUser(
                { entityRef: { name: username } },
                {
                  dangerousEntityRefFallback: {
                    entityRef: { name: username },
                  },
                },
              );
            },
          }),
        });
      },
    });
  },
});
