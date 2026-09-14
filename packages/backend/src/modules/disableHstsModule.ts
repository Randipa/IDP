import { createBackendModule, coreServices } from '@backstage/backend-plugin-api';

function stripHsts(
  _req: unknown,
  res: {
    setHeader: (name: string, value: unknown) => unknown;
  },
  next: () => void,
) {
  const original = res.setHeader.bind(res);
  res.setHeader = (name: string, value: unknown) => {
    if (String(name).toLowerCase() === 'strict-transport-security') {
      return res;
    }
    return original(name, value);
  };
  next();
}

export default createBackendModule({
  pluginId: 'app',
  moduleId: 'disable-hsts',
  register(env) {
    env.registerInit({
      deps: { rootHttpRouter: coreServices.rootHttpRouter },
      async init({ rootHttpRouter }) {
        rootHttpRouter.use('/api', stripHsts);
        rootHttpRouter.use('/healthcheck', stripHsts);
      },
    });
  },
});
