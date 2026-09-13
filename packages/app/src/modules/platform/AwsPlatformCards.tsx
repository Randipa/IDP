import { InfoCard, Link } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import CloudQueueIcon from '@material-ui/icons/CloudQueue';

const AWS_REGION_ANNOTATION = 'company.io/aws-region';
const SST_STAGES_ANNOTATION = 'company.io/sst-stages';

function readAnnotation(entity: ReturnType<typeof useEntity>['entity'], key: string) {
  return entity.metadata.annotations?.[key];
}

export const AwsOverviewCard = () => {
  const { entity } = useEntity();
  const region = readAnnotation(entity, AWS_REGION_ANNOTATION) ?? 'Not configured';
  const stages =
    readAnnotation(entity, SST_STAGES_ANNOTATION)?.split(',').map(stage => stage.trim()) ??
    ['dev', 'staging', 'production'];

  return (
    <InfoCard title="AWS Deployment" icon={<CloudQueueIcon />}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2">Region</Typography>
          <Typography variant="body2">{region}</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2">SST stages</Typography>
          <Typography variant="body2">{stages.join(', ')}</Typography>
        </Grid>
      </Grid>
    </InfoCard>
  );
};

export const AwsDeploymentContent = () => {
  const { entity } = useEntity();
  const region = readAnnotation(entity, AWS_REGION_ANNOTATION) ?? 'ap-south-1';
  const stages =
    readAnnotation(entity, SST_STAGES_ANNOTATION)?.split(',').map(stage => stage.trim()) ??
    ['dev', 'staging', 'production'];
  const projectSlug = entity.metadata.annotations?.['github.com/project-slug'];

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <InfoCard title="SST deployment model">
          <Typography variant="body2" paragraph>
            This service deploys to a single AWS account using SST stage isolation.
          </Typography>
          <Typography variant="subtitle2">Configured region</Typography>
          <Typography variant="body2" paragraph>
            {region}
          </Typography>
          <Typography variant="subtitle2">Active stages</Typography>
          <Typography variant="body2">{stages.join(' → ')}</Typography>
        </InfoCard>
      </Grid>
      <Grid item xs={12} md={6}>
        <InfoCard title="Useful links">
          <Typography variant="body2" paragraph>
            <Link to={`https://${region}.console.aws.amazon.com/`}>AWS Console ({region})</Link>
          </Typography>
          {projectSlug ? (
            <Typography variant="body2" paragraph>
              <Link to={`https://github.com/${projectSlug}/actions`}>
                GitHub Actions ({projectSlug})
              </Link>
            </Typography>
          ) : null}
          <Typography variant="body2">
            Platform docs: reusable deploy workflows and OIDC roles live in the Company IDP
            repository.
          </Typography>
        </InfoCard>
      </Grid>
    </Grid>
  );
};

export function isAwsDeploymentEntity(entity: { metadata: { annotations?: Record<string, string> } }) {
  return Boolean(
    entity.metadata.annotations?.[AWS_REGION_ANNOTATION] ||
      entity.metadata.annotations?.['github.com/project-slug'],
  );
}
