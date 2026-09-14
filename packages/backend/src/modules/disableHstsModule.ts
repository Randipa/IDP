import { createBackendModule, coreServices } from '@backstage/backend-plugin-api';
import type { RequestHandler } from 'express';

const stripHsts: RequestHandler = (_req, res, next) => {
  const original = res.setHeader.bind(res);
  res.setHeader = (name, value) => {
    if (String(name).toLowerCase() === 'strict-transport-security') {
      return res;
    }
    return original(name, value);
  };
  next();
};

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
