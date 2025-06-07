'use client';
import { useEffect, useState } from 'react';

export default function CacheMetricsPage() {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    fetch('/api/cache/metrics').then(async res => {
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.data);
      }
    });
  }, []);

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Cache Metrics</h1>
      {!metrics ? <p>Loading...</p> : (
        <pre className="bg-muted p-4 rounded">
          {JSON.stringify(metrics, null, 2)}
        </pre>
      )}
    </div>
  );
}
