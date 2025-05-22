import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabase } from '@/adapters/database/supabase-provider';
import { authOptions } from '@/lib/auth';

/**
 * Get the current user from a request
 * @param req The Next.js request object
 * @returns The user object or null if not authenticated
 */
export async function getUserFromRequest(req: NextRequest) {
  try {
    // First try to get the user from the session
    const session = await getServerSession(authOptions);
    if (session?.user) {
      return session.user;
    }

    // If no session, try to get the user from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return null;
    }

    return {
      id: data.user.id,
      email: data.user.email,
      role: data.user.user_metadata?.role || 'user',
    };
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
    // Query the email_verification table
    const { data, error } = await supabase
      .from('email_verification')
      .select('user_id, expires_at')
      .eq('token', token)
      .single();

    if (error || !data) {
      return null;
    }

    // Check if token has expired
    const now = new Date();
    const expiresAt = new Date(data.expires_at);
    
    if (now > expiresAt) {
      return null;
    }

    return data.user_id;
  } catch (error) {
    console.error('Error verifying email token:', error);
    return null;
  }
} 