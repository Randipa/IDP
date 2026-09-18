import { fetchBackendHealth, getClientMetadata } from '@/lib/api';

export default async function ClientHomePage() {
  const metadata = getClientMetadata();
  const health = await fetchBackendHealth().catch(() => ({ status: 'unavailable' }));

  return (
    <main>
      <h1>{metadata.app} Client</h1>
      <p>{metadata.description}</p>
      <section className="card">
        <h2>Backend status</h2>
        <p>
          API health: <code>{health.status}</code>
        </p>
      </section>
    </main>
  );
}
