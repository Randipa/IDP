import { createApp } from '@backstage/frontend-defaults';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import catalogImportPlugin from '@backstage/plugin-catalog-import/alpha';
import githubActionsPlugin from '@backstage-community/plugin-github-actions/alpha';
import sonarqubePlugin from '@backstage-community/plugin-sonarqube/alpha';
import notificationsPlugin from '@backstage/plugin-notifications/alpha';
import signalsPlugin from '@backstage/plugin-signals/alpha';
import { navModule } from './modules/nav';
import { homeModule } from './modules/home';
import { awsPlatformModule } from './modules/platform';
import { authModule } from './modules/auth';

export default createApp({
  features: [
    authModule,
    signalsPlugin,
    notificationsPlugin,
    catalogPlugin,
    catalogImportPlugin,
    githubActionsPlugin,
    sonarqubePlugin,
    awsPlatformModule,
    navModule,
    homeModule,
  ],
});
