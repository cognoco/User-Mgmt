import { NextRequest } from 'next/server';
import { generateTestJwt } from '@/tests/utils/supabase-auth-utils';

export function createAuthenticatedRequest(
  method: string,
  url: string,
  body?: any,
  token: string = generateTestJwt()
) {
  const init: RequestInit = {
    method,
    headers: { Authorization: `Bearer ${token}` },
  };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }
  return new NextRequest(new URL(url), init);
}
