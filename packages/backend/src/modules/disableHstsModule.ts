import { createBackendModule, coreServices } from '@backstage/backend-plugin-api';

export default createBackendModule({
  pluginId: 'app',
  moduleId: 'disable-hsts',
  register(env) {
    env.registerInit({
      deps: { rootHttpRouter: coreServices.rootHttpRouter },
      async init({ rootHttpRouter }) {
        rootHttpRouter.use('/', (_req, res, next) => {
          res.on('headers', () => {
            res.removeHeader('Strict-Transport-Security');
          });
          next();
        });
      },
    });
  },
});
