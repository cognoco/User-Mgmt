import { NextRequest } from 'next/server';

export function createAuthenticatedRequest(method: string, url: string, body?: any) {
  const init: RequestInit = { method };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }
  return new NextRequest(new URL(url), init);
}
