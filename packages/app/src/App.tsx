import { createApp } from '@backstage/frontend-defaults';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import githubActionsPlugin from '@backstage-community/plugin-github-actions/alpha';
import sonarqubePlugin from '@backstage-community/plugin-sonarqube/alpha';
import { navModule } from './modules/nav';
import { homeModule } from './modules/home';
import { awsPlatformModule } from './modules/platform';
import { authModule } from './modules/auth';

export default createApp({
  features: [
    authModule,
    catalogPlugin,
    githubActionsPlugin,
    sonarqubePlugin,
    awsPlatformModule,
    navModule,
    homeModule,
  ],
});
