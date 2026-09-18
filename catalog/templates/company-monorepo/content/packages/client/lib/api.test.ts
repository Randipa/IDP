import { getClientMetadata } from './api';

describe('getClientMetadata', () => {
  it('returns the project name', () => {
    expect(getClientMetadata().app).toBe('${{ values.name }}');
  });
});
