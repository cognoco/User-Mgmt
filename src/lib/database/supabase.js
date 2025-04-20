import { createClient } from '@supabase/supabase-js';

// Read Supabase configuration from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Server-side only

if (!supabaseUrl) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
}
if (!supabaseAnonKey) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Create a single supabase client for interacting with your database (client-side safe)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Get a Supabase instance with the service role key for admin operations (server-side only)
export function getServiceSupabase() {
  if (!supabaseServiceKey) {
    // It's okay if this isn't set unless this function is explicitly called server-side
    console.warn('SUPABASE_SERVICE_ROLE_KEY is not set. Service role operations will fail.');
    // Depending on usage, you might throw an error here or return null/undefined
    // For now, let's allow creation but it will fail on use if key is missing
    // throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  // We still need the URL and a key, even if it's the anon key for the function signature.
  // Operations requiring service role will fail if the service key is actually missing.
  return createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);
} 