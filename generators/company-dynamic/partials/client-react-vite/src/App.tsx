import { useEffect, useState } from 'react';

const DEFAULT_API_URL = 'http://localhost:3000/api';

function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_URL ?? DEFAULT_API_URL;
}

export function App() {
  const [health, setHealth] = useState('loading');
  const appName = import.meta.env.VITE_APP_NAME ?? '{{name}}';

  useEffect(() => {
    fetch(`${getApiBaseUrl()}/health`)
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: { status: string }) => setHealth(data.status))
      .catch(() => setHealth('unavailable'));
  }, []);

  return (
    <main>
      <h1>{appName} Client</h1>
      <p>{{description}}</p>
      <section className="card">
        <h2>Public client app</h2>
        <p>
          Backend health: <code>{health}</code>
        </p>
        <p>
          Client app: <a href="http://localhost:3001">http://localhost:3001</a>
        </p>
      </section>
    </main>
  );
}
