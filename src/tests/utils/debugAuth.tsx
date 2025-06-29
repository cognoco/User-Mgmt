/**
 * Utility to debug auth middleware issues
 */
import { withAuth } from '@/middleware/auth';
import { supabase } from '@/lib/supabase';

/**
 * Logs detailed information about auth behavior
 */
export interface DebugAuthOptions {
  requireAdmin?: boolean;
}

export function debugAuth(token: string, options: DebugAuthOptions = {}) {
  console.log('=== Auth Debugging ===');
  console.log('Token:', token);
  console.log('Options:', options);
  
  // Check token extraction
  const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  const extractedToken = authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : authHeader;
  console.log('Extracted token:', extractedToken);
  
  // Mock user response
  const mockUser = {
    id: 'test-user',
    email: 'test@example.com',
    role: 'authenticated',
    app_metadata: { role: options.requireAdmin ? 'admin' : 'user' }
  };
  
  console.log('Mock user:', mockUser);
  
  // Check if admin would be required and granted
  if (options.requireAdmin) {
    const isAdmin = mockUser.app_metadata?.role === 'admin';
    console.log('Is admin required:', options.requireAdmin);
    console.log('Is user admin:', isAdmin);
    console.log('Admin access would be:', isAdmin ? 'GRANTED' : 'DENIED');
  }
  
  console.log('=====================');
}

export default debugAuth;
