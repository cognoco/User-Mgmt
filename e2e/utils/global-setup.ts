import { setupI18n } from './i18n-setup';
import * as dotenv from 'dotenv';
import path from 'path';
import { ensureUserExists } from './user-setup';
import { startMsw, stopMsw } from './msw-supabase';

// Load environment variables from the root .env file so test and application
// share the same values when running E2E
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Test credentials - should match the ones used in tests
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || 'adminpassword';
const USER_EMAIL = process.env.E2E_USER_EMAIL || 'user@example.com';
const USER_PASSWORD = process.env.E2E_USER_PASSWORD || 'password123';

export default async () => {
  // Setup i18n
  await setupI18n();

  const useSupabase = process.env.E2E_USE_SUPABASE === 'true';

  // Check if Supabase credentials are available
  const hasSupabaseConfig =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (useSupabase && hasSupabaseConfig) {
    try {
      console.log('Setting up test users in Supabase for E2E tests...');
      
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
      
      console.log('Test users created successfully');
    } catch (error) {
      console.error('Failed to create test users:', error);
      console.warn('E2E tests requiring authentication might fail.');
    }
  } else {
    if (!useSupabase) {
      console.log('E2E_USE_SUPABASE not enabled. Starting MSW supabase mocks.');
      await startMsw();
    } else {
      console.warn('Supabase configuration missing. Cannot create test users.');
      console.warn('E2E tests requiring authentication will be skipped.');
    }
  }
  return async () => {
    if (!useSupabase) {
      await stopMsw();
    }
  };
};
