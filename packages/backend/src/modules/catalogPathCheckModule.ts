import fs from 'fs';
import { createBackendModule, coreServices } from '@backstage/backend-plugin-api';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';

export default createBackendModule({
  pluginId: 'catalog',
  moduleId: 'catalog-path-check',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        catalog: catalogServiceRef,
      },
      async init({ logger, config, catalog }) {
        const locations = config.getOptionalConfigArray('catalog.locations') ?? [];
        logger.info(`Configured catalog locations: ${locations.length}`);

        for (const location of locations) {
          const target = location.getString('target');
          const exists = fs.existsSync(target);
          logger.info(
            `Catalog location ${location.getOptionalString('type') ?? 'file'} target=${target} exists=${exists}`,
          );
        }

        setTimeout(() => {
          void catalog
            .queryEntities({ limit: 0 })
            .then(result => {
              logger.info(
                `Catalog entities in database after startup: ${result.totalItems}`,
              );
            })
            .catch(error => {
              logger.warn(`Catalog entity count check failed: ${error}`);
            });
        }, 120_000);
      },
    });
  },
});
