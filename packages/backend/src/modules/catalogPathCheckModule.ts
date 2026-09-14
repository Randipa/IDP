import fs from 'fs';
import { createBackendModule, coreServices } from '@backstage/backend-plugin-api';

export default createBackendModule({
  pluginId: 'catalog',
  moduleId: 'catalog-path-check',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
      },
      async init({ logger, config }) {
        const locations = config.getOptionalConfigArray('catalog.locations') ?? [];
        logger.info(`Configured catalog locations: ${locations.length}`);

        for (const location of locations) {
          const target = location.getString('target');
          const exists = fs.existsSync(target);
          logger.info(
            `Catalog location ${location.getOptionalString('type') ?? 'file'} target=${target} exists=${exists}`,
          );
        }
      },
    });
  },
});
