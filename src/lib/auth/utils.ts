import { NextRequest } from 'next/server';
import { getServiceSupabase } from '@/lib/database/supabase';

/**
 * Object representing an authenticated user returned by utilities in this file.
 */
export interface AuthenticatedUser {
  id: string;
  email: string | null;
  role: string;
}

/**
 * Validate a raw authentication token using Supabase.
 *
 * @param token Authentication bearer token
 * @returns The authenticated user or null when invalid
 */
export async function validateAuthToken(token: string): Promise<AuthenticatedUser | null> {
  if (!token) return null;
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return null;
    return {
      id: data.user.id,
      email: data.user.email ?? null,
      role: data.user.user_metadata?.role || 'user',
    };
  } catch (err) {
    console.error('[auth] token validation failed:', err);
    return null;
  }
}

/**
 * Extract the bearer token from a request.
 *
 * The function checks the `Authorization` header first and falls back to the
 * `sb-access-token` cookie. Both `Bearer <token>` and raw token formats are
 * supported for backwards compatibility.
 */
export function extractAuthToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization') || '';
  let token = '';

  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (authHeader) {
    token = authHeader.trim();
  } else {
    token = req.cookies.get('sb-access-token')?.value || '';
  }

  const finalToken = token || null;
  console.log('[auth] extracted token', finalToken ? 'present' : 'missing');
  return finalToken;
}

/**
 * Get the current user from a request
 * @param req The Next.js request object
 * @returns The user object or null if not authenticated
 */
export async function getUserFromRequest(
  req: NextRequest
): Promise<AuthenticatedUser | null> {
  try {
    const token = extractAuthToken(req);
    if (!token) {
      console.log('[getUserFromRequest] no token provided');
      return null;
    }

    const user = await validateAuthToken(token);
    if (user) {
      console.log('[getUserFromRequest] authenticated', user.id);
    } else {
      console.warn('[getUserFromRequest] invalid token');
    }
    return user;
  } catch (error) {
    console.error('Error getting user from request:', error);
    return null;
  }
}

/**
 * Verify an email verification token
 * @param token The email verification token to verify
 * @returns The user ID if valid, null otherwise
 */
export async function verifyEmailToken(token: string): Promise<string | null> {
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('email_verification')
      .select('user_id, expires_at')
      .eq('token', token)
      .single();

    if (error || !data) {
      console.error('[verifyEmailToken] lookup failed', error);
      return null;
    }

    const expiresAt = new Date(data.expires_at);
    if (Date.now() > expiresAt.getTime()) {
      console.log('[verifyEmailToken] token expired');
      return null;
    }

    console.log('[verifyEmailToken] valid for user', data.user_id);
    return data.user_id;
  } catch (error) {
    console.error('Error verifying email token:', error);
    return null;
  }
}
