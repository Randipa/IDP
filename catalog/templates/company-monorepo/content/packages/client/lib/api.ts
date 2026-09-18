const DEFAULT_API_URL = 'http://localhost:3000/api';

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL;
}

export async function fetchBackendHealth(): Promise<{ status: string }> {
  const response = await fetch(`${getApiBaseUrl()}/health`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Backend health check failed');
  }

  return response.json();
}

export function getClientMetadata() {
  return {
    app: '${{ values.name }}',
    surface: 'client',
    description: '${{ values.description }}',
  };
}
