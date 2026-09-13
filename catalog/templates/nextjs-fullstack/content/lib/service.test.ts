import { getServiceMetadata } from '@/lib/service';

describe('getServiceMetadata', () => {
  it('returns service metadata', () => {
    expect(getServiceMetadata()).toEqual({
      message: 'Next.js fullstack application is running',
      service: '${{ values.name }}',
    });
  });
});
