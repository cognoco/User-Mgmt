import { setupServer } from 'msw/node';
import { http } from 'msw';

// Basic placeholder handlers for Supabase endpoints used in tests
// Extend these handlers with real data as needed
export const server = setupServer(
  http.post('https://*/auth/v1/token', () => {
    return Response.json({
      access_token: 'test-token',
      user: { id: 'test-user', email: 'mock@example.com' },
    });
  })
  // Add additional handlers for your tests
);

export async function startMsw() {
  server.listen({ onUnhandledRequest: 'bypass' });
}

export async function stopMsw() {
  server.close();
}
