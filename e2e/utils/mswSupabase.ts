import { setupServer } from 'msw/node';
import { http } from 'msw';

// Enhanced MSW handlers for comprehensive Supabase API mocking
export const server = setupServer(
  // Auth endpoints
  http.post('https://*/auth/v1/token', async ({ request }) => {
    const url = new URL(request.url);
    const grantType = url.searchParams.get('grant_type');
    
    if (grantType === 'password') {
      // Login endpoint
      const body = await request.json() as any;
      
      // Mock successful login
      return Response.json({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
        user: {
          id: 'mock-user-id',
          email: body.email,
          email_confirmed_at: new Date().toISOString()
        }
      });
    }
    
    // Default token response
    return Response.json({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
      user: { 
        id: 'mock-user-id', 
        email: 'mock@example.com',
        email_confirmed_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      },
    });
  }),

  // Registration endpoint
  http.post('https://*/auth/v1/signup', async ({ request }) => {
    const body = await request.json() as any;
    
    // Simulate duplicate email error for testing
    if (body.email === 'existing@example.com') {
      return new Response(
        JSON.stringify({
          error: 'User already registered',
          error_description: 'A user with this email address has already been registered'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Successful registration
    return Response.json({
      user: {
        id: 'new-user-id',
        email: body.email,
        created_at: new Date().toISOString(),
        email_confirmed_at: null // Email not confirmed yet
      },
      session: null // No session until email confirmed
    });
  }),

  // Email verification
  http.post('https://*/auth/v1/verify', () => {
    return Response.json({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
      user: {
        id: 'mock-user-id',
        email: 'verified@example.com',
        email_confirmed_at: new Date().toISOString()
      }
    });
  }),

  // Password reset
  http.post('https://*/auth/v1/recover', () => {
    return Response.json({});
  }),

  // Profile/user data endpoints
  http.get('https://*/auth/v1/user', () => {
    return Response.json({
      id: 'mock-user-id',
      email: 'mock@example.com',
      email_confirmed_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    });
  }),

  // Catch-all for other Supabase requests
  http.all('https://*.supabase.co/*', () => {
    return Response.json({ success: true });
  })
);

export async function startMsw() {
  console.log('Starting MSW server for Supabase API mocking...');
  server.listen({ 
    onUnhandledRequest: 'bypass' 
  });
}

export async function stopMsw() {
  console.log('Stopping MSW server...');
  server.close();
}
