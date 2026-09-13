import { getHealthStatus } from '@/lib/health';
import { getServiceMetadata } from '@/lib/service';

export default function HomePage() {
  const metadata = getServiceMetadata();
  const health = getHealthStatus();

  return (
    <main>
      <h1>{metadata.service}</h1>
      <p>{metadata.message}</p>
      <section className="card">
        <h2>Health check</h2>
        <p>
          API status: <code>{health.status}</code>
        </p>
      </section>
    </main>
  );
}
