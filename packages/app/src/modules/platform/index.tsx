import { createFrontendModule } from '@backstage/frontend-plugin-api';
import {
  EntityCardBlueprint,
  EntityContentBlueprint,
} from '@backstage/plugin-catalog-react/alpha';
import CloudQueueIcon from '@material-ui/icons/CloudQueue';
import { isAwsDeploymentEntity } from './AwsPlatformCards';

const awsOverviewCard = EntityCardBlueprint.make({
  params: {
    filter: isAwsDeploymentEntity,
    loader: async () => {
      const { AwsOverviewCard } = await import('./AwsPlatformCards');
      return <AwsOverviewCard />;
    },
  },
});

const awsDeploymentContent = EntityContentBlueprint.make({
  params: {
    path: 'aws',
    title: 'AWS',
    group: 'deployment',
    icon: <CloudQueueIcon />,
    filter: isAwsDeploymentEntity,
    loader: async () => {
      const { AwsDeploymentContent } = await import('./AwsPlatformCards');
      return <AwsDeploymentContent />;
    },
  },
});

export const awsPlatformModule = createFrontendModule({
  pluginId: 'catalog',
  extensions: [awsOverviewCard, awsDeploymentContent],
});
