import { NextRequest } from 'next/server';

/**
 * Utility to call route handlers with proper Next.js signature.
 * Handles both parameterized and non-parameterized routes.
 */

export interface RouteCallOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  searchParams?: Record<string, string>;
}

/**
 * Call a non-parameterized route handler
 */
export function callRoute(
  handler: (req: NextRequest) => Promise<Response>,
  url: string = 'http://test',
  options: RouteCallOptions = {}
): Promise<Response> {
  const { method = 'GET', body, headers = {}, searchParams } = options;
  
  const urlWithParams = new URL(url);
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      urlWithParams.searchParams.set(key, value);
    });
  }

  const requestInit: {
    method: string;
    headers: Record<string, string>;
    body?: string;
  } = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body && method !== 'GET') {
    requestInit.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const req = new NextRequest(urlWithParams.toString(), requestInit as any);
  return handler(req);
}

/**
 * Call a parameterized route handler (with URL params)
 */
export function callRouteWithParams<T extends Record<string, string>>(
  handler: (req: NextRequest, context: { params: Promise<T> }) => Promise<Response>,
  params: T,
  url: string = 'http://test',
  options: RouteCallOptions = {}
): Promise<Response> {
  const { method = 'GET', body, headers = {}, searchParams } = options;
  
  const urlWithParams = new URL(url);
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      urlWithParams.searchParams.set(key, value);
    });
  }

  const requestInit: {
    method: string;
    headers: Record<string, string>;
    body?: string;
  } = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body && method !== 'GET') {
    requestInit.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const req = new NextRequest(urlWithParams.toString(), requestInit as any);
  
  // Create a Promise that resolves to the params immediately
  // This simulates how Next.js provides params to route handlers
  const paramsPromise = Promise.resolve(params);
  
  return handler(req, { params: paramsPromise });
}

/**
 * Legacy wrapper for backward compatibility during transition.
 * This should be removed once all tests are updated.
 * @deprecated Use callRoute or callRouteWithParams instead
 */
export function wrapHandler<T extends any[]>(
  handler: (...args: T) => Promise<Response>
): (...args: T) => Promise<Response> {
  return handler;
} 