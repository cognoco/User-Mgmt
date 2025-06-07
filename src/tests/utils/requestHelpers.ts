import { NextRequest } from 'next/server';
import { generateTestJwt } from '@/tests/utils/supabaseAuthUtils';

/**
 * Create a request object with an Authorization header set.
 *
 * This helper simplifies testing authenticated API routes by
 * automatically attaching a bearer token. Pass `null` for `token`
 * to simulate an unauthenticated request.
 */
export function createAuthenticatedRequest(
  method: string,
  url: string,
  body?: any,
  token: string | null = 'test-token',
) {
  const headers: HeadersInit = {};
  if (token) {
    headers['authorization'] = `Bearer ${token}`;
  }
  const init: RequestInit = { method, headers };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
    headers['content-type'] = 'application/json';
  }
  return new NextRequest(new URL(url), init);
}
