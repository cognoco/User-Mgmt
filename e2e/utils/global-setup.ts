import { setupI18n } from './i18n-setup';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { ensureUserExists } from './user-setup';
import { startMsw, stopMsw } from './msw-supabase';

// Correct ESM path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root .env file so test and application
// share the same values when running E2E
const envPath = path.resolve(__dirname, '../../.env');
const envResult = dotenv.config({ path: envPath });

// Debug environment loading
console.log(`Loading .env from: ${envPath}`);
console.log(`Dotenv result:`, envResult.error ? `Error: ${envResult.error}` : 'Success');

// Explicitly ensure the environment variables are available
if (envResult.parsed) {
  // Set them explicitly in process.env if they're not already there
  for (const [key, value] of Object.entries(envResult.parsed)) {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
  
  console.log('Environment variables loaded from .env file:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING');
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING');
  console.log('- SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING');
} else {
  console.log('WARNING: No variables parsed from .env file in global setup, using fallback...');
  
  // If dotenv parsing fails, manually set the known Supabase variables
  // This is a fallback for when dotenv has parsing issues
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://izziigqgdurqsoyvajvu.supabase.co';
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6emlpZ3FnZHVycXNveXZhanZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2MjYyODksImV4cCI6MjA1NzIwMjI4OX0.6njjAphh3g39kIi8jQJx8xsvelXP-zDrm-wP9-OJ1Fs';
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6emlpZ3FnZHVycXNveXZhanZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTYyNjI4OSwiZXhwIjoyMDU3MjAyMjg5fQ.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6emlpZ3FnZHVycXNveXZhanZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTYyNjI4OSwiZXhwIjoyMDU3MjAyMjg5fQ';
  }
  
  console.log('Fallback environment variables in global setup:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING');
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING');
  console.log('- SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING');
}

// Test credentials - should match the ones used in tests
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || 'Password123!';
const USER_EMAIL = process.env.E2E_USER_EMAIL || 'user@example.com';
const USER_PASSWORD = process.env.E2E_USER_PASSWORD || 'Password123!';

export default async () => {
  // Setup i18n
  await setupI18n();

  // Use real Supabase by default (set E2E_USE_SUPABASE=false to use mocks)
  const useSupabase = process.env.E2E_USE_SUPABASE !== 'false';

  // Debug environment variables
  console.log('DEBUG ENV VARS:');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING');

  // Check if Supabase credentials are available
  const hasSupabaseConfig =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log(`E2E Setup: useSupabase=${useSupabase}, hasSupabaseConfig=${hasSupabaseConfig}`);

  if (useSupabase && hasSupabaseConfig) {
    try {
      console.log('Setting up test users in real Supabase for E2E tests...');
      
      // Create admin user with admin role in metadata
      await ensureUserExists(ADMIN_EMAIL, {
        password: ADMIN_PASSWORD,
        metadata: { role: 'admin' },
        confirmEmail: true
      });
      
      // Create regular user
      await ensureUserExists(USER_EMAIL, {
        password: USER_PASSWORD,
        confirmEmail: true
      });
      
      console.log('Test users created successfully in real Supabase');
    } catch (error) {
      console.error('Failed to create test users in Supabase:', error);
      console.warn('Falling back to MSW mocks due to Supabase setup failure.');
      await startMsw();
    }
  } else {
    if (useSupabase && !hasSupabaseConfig) {
      console.warn('E2E_USE_SUPABASE is enabled but Supabase configuration is missing.');
      console.warn('Falling back to MSW mocks for API simulation.');
    } else {
      console.log('Using MSW mocks for Supabase API simulation (E2E_USE_SUPABASE=false).');
    }
    await startMsw();
  }
  
  return async () => {
    if (!useSupabase || !hasSupabaseConfig) {
      await stopMsw();
    }
  };
};
