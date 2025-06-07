import { NextRequest } from 'next/server';
import { getServiceSupabase } from '@/lib/database/supabase';
import { hashApiKey, getKeyPrefix } from '@/src/lib/api-keys/apiKeyUtils'107;

export interface ApiKeyAuthResult {
  authenticated: boolean;
  userId?: string;
  keyId?: string;
  scopes?: string[];
  error?: string;
}

/**
 * Authenticates a request using an API key
 * @param req The Next.js request object
 * @returns Authentication result with user ID and scopes if successful
 */
export async function authenticateApiKey(req: NextRequest): Promise<ApiKeyAuthResult> {
  // Get the API key from the Authorization header
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authenticated: false, error: 'Missing or invalid Authorization header' };
  }
  
  const apiKey = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  if (!apiKey || apiKey.trim() === '') {
    return { authenticated: false, error: 'API key not provided' };
  }
  
  try {
    // Extract prefix from the key
    const prefix = getKeyPrefix(apiKey);
    
    if (!prefix) {
      return { authenticated: false, error: 'Invalid API key format' };
    }
    
    // Hash the provided key for comparison
    const hashedKey = hashApiKey(apiKey);
    
    // Find the key in the database by prefix
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('api_keys')
      .select('id, key_hash, user_id, scopes, expires_at, is_revoked')
      .eq('prefix', prefix)
      .eq('is_revoked', false)
      .single();
    
    if (error || !data) {
      console.error('API key lookup error or key not found:', error);
      return { authenticated: false, error: 'Invalid API key' };
    }
    
    // Check if the key is expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      console.log('API key expired:', data.id);
      return { authenticated: false, error: 'API key expired' };
    }
    
    // Verify that the hashed keys match
    if (data.key_hash !== hashedKey) {
      console.log('API key hash mismatch');
      return { authenticated: false, error: 'Invalid API key' };
    }
    
    // Update last used timestamp
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', data.id);
    
    // Authentication successful
    return {
      authenticated: true,
      userId: data.user_id,
      keyId: data.id,
      scopes: data.scopes as string[]
    };
  } catch (error) {
    console.error('Error authenticating API key:', error);
    return { authenticated: false, error: 'Authentication error' };
  }
} 