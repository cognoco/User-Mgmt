'use client';
import { useEffect } from 'react';

export default function ApiDocsPage() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js';
    script.onload = () => {
      // @ts-ignore
      window.SwaggerUIBundle({
        url: '/api/openapi',
        dom_id: '#swagger',
      });
    };
    document.body.appendChild(script);
  }, []);

  return (
    <div>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css"
      />
      <div id="swagger" />
    </div>
  );
}
