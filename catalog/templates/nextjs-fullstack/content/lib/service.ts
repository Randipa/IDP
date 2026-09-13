export function getServiceMetadata() {
  return {
    message: 'Next.js fullstack application is running',
    service: '${{ values.name }}',
  };
}
