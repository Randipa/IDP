import { createBackendModule } from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node';
import { createRunCompanyGeneratorAction } from '../actions/runCompanyGeneratorAction';

export default createBackendModule({
  pluginId: 'scaffolder',
  moduleId: 'company-generator',
  register(env) {
    env.registerInit({
      deps: {
        scaffolderActions: scaffolderActionsExtensionPoint,
      },
      async init({ scaffolderActions }) {
        scaffolderActions.addActions(createRunCompanyGeneratorAction());
      },
    });
  },
});
