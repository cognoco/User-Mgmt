import { createClient } from '@supabase/supabase-js';
// Keep this import if config is used elsewhere, but we won't use the object here
// import { supabaseConfig } from '@/lib/config'; 

// ---> ADD LOGS FOR ENV VARS <---
console.log('[Supabase Client ENV] NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('[Supabase Client ENV] NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Exists' : 'MISSING or empty');
// --- END LOGS ---

console.log('[Supabase Client] Initializing client-side instance with URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
// Create a single supabase client for interacting with your database (Client-side)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ---> REMOVE TEMPORARY DEBUGGING CODE <---
// if (typeof window !== 'undefined') {
//   console.log('[Supabase Client] Attaching client to window.supabase for debugging.');
//   (window as any).supabase = supabase;
// }
// ---> END REMOVAL <---

/**
 * Create a Supabase client instance
 * This function is used by the app-init.ts file
 */
export function createSupabaseClient() {
  console.log('[Supabase Client] Creating new client instance');
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Supabase environment variables are not configured properly');
    throw new Error('Supabase configuration missing');
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// Get a Supabase instance with the service role key for admin operations (Server-side)
export function getServiceSupabase() {
  console.log('[Supabase Service] Creating service-side instance for URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  // ---> ADD LOGS FOR SERVICE ENV VARS <---
  console.log('[Supabase Service ENV] SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Exists' : 'MISSING or empty');
  // --- END LOGS ---

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is not set. Backend operations requiring admin privileges will fail.');
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured.');
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
     throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured.');
  }

  // Ensure service client is only created once per request lifecycle if needed, or manage scope appropriately.
  // For simple API routes, creating it on demand might be okay.
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export { createClient };