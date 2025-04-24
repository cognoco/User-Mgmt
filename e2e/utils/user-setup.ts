import { User } from '@supabase/supabase-js';
import { getServiceSupabase } from '../../src/lib/database/supabase'; // Adjust path if necessary

// Ensure you have configured a way to get the service role client
// This might involve setting env vars specifically for the test environment
const supabaseAdmin = getServiceSupabase();

/**
 * Ensures a user exists in the database for testing purposes.
 * Creates the user if they don't exist.
 * Confirms the email automatically.
 * IMPORTANT: Use with caution. Best used in isolated test environments.
 *
 * @param email The email of the user to ensure exists.
 * @param options Optional parameters for user creation.
 * @returns The Supabase User object.
 */
export async function ensureUserExists(
  email: string,
  options: {
    password?: string;
    isSSO?: boolean; // Note: Setting is_sso_user might require direct DB update
    metadata?: object;
    confirmEmail?: boolean;
  } = {}
): Promise<User> {
  const { password = 'password123', isSSO = false, metadata = {}, confirmEmail = true } = options;

  try {
    // Check if user already exists (using admin API)
    // Note: listUsers might paginate, for simple existence check this is usually fine.
    // If dealing with many users, consider filtering more precisely or handling pagination.
    const { data: existingUserData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
       page: 1, 
       perPage: 1,
       // There isn't a direct filter by email in listUsers, so we fetch one and check.
       // For more robust checks, you might need to query your public profiles or a dedicated user table if you have one.
    });

    // Attempt to find the user by email in the potentially fetched list (or first page)
    const existingUser = existingUserData?.users.find(u => u.email === email);

    if (listError) {
        // Handle specific errors if needed, otherwise rethrow
        console.error(`Error listing users to check for ${email}:`, listError.message);
        throw listError;
    }

    if (existingUser) {
      console.log(`[Test Setup] User ${email} already exists (ID: ${existingUser.id}).`);
      // Optionally update metadata or other properties if needed for the test
      // Example: await supabaseAdmin.auth.admin.updateUserById(existingUser.id, { user_metadata: { ...existingUser.user_metadata, ...metadata } });
      // TODO: Implement logic to update is_sso_user if needed and possible via admin API, otherwise use direct DB update
      return existingUser;
    } else {
      console.log(`[Test Setup] Creating test user ${email}...`);
      const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password, // Provide a default or allow override
        email_confirm: confirmEmail, // Auto-confirm for tests unless specified otherwise
        user_metadata: { ...metadata },
        // Note: is_sso_user cannot be directly set via admin createUser AFAIK
      });

      if (createUserError) {
        console.error(`[Test Setup] Error creating user ${email}:`, createUserError.message);
        throw createUserError;
      }
      if (!newUser?.user) {
         throw new Error(`[Test Setup] Failed to create user ${email}, no user data returned.`);
      }

      console.log(`[Test Setup] User ${email} created with ID: ${newUser.user.id}`);

      // If isSSO is true, we likely need a direct DB update as the admin API doesn't support setting this flag directly.
      if (isSSO) {
         console.warn(`[Test Setup] Setting is_sso_user=true for ${email} requires direct DB access (not implemented in this helper yet).`);
         // Example (requires raw SQL execution capabilities):
         // await runRawSql(`UPDATE auth.users SET is_sso_user = true WHERE id = '${newUser.user.id}'`);
      }

      return newUser.user;
    }
  } catch (error) {
    console.error(`[Test Setup] Fatal error in ensureUserExists for ${email}:`, error);
    // Rethrow the error to fail the test setup clearly
    throw error;
  }
}

/**
 * Links an external OAuth provider identity to a user.
 * Assumes direct database access is available for inserting into auth.identities.
 *
 * @param userId The Supabase user ID (UUID).
 * @param provider The name of the provider (e.g., 'google', 'github').
 * @param providerUserId The user's ID on the provider's system.
 * @param identityData JSON object containing identity details (email, name, etc.).
 */
export async function linkProviderIdentity(userId: string, provider: string, providerUserId: string, identityData: object) {
  console.log(`[Test Setup] Linking ${provider} (ID: ${providerUserId}) to user ${userId}...`);
  // IMPORTANT: This requires direct DB access, as admin API doesn't manage identities directly.
  // Use the service role client to insert into auth.identities.
  const { error } = await supabaseAdmin
    .from('identities') // Direct table access using admin client
    .insert({
      user_id: userId,
      provider: provider,
      id: providerUserId, // Provider's user ID often used as the 'id' column in Supabase identities
      identity_data: identityData,
      // last_sign_in_at: new Date() // Optional: Set last sign-in time
    });

  if (error) {
    console.error(`[Test Setup] Error linking ${provider} for user ${userId}:`, error);
    // Handle potential conflicts (e.g., identity already exists) gracefully if needed
    if (error.code === '23505') { // Unique violation
        console.warn(`[Test Setup] Identity ${provider}:${providerUserId} might already be linked.`);
    } else {
        throw error;
    }
  } else {
    console.log(`[Test Setup] Successfully linked ${provider} for user ${userId}.`);
  }
}


/**
 * Unlinks an external OAuth provider identity from a user.
 * Assumes direct database access is available for deleting from auth.identities.
 *
 * @param userId The Supabase user ID (UUID).
 * @param provider The name of the provider (e.g., 'google', 'github').
 */
export async function unlinkProviderIdentity(userId: string, provider: string) {
    console.log(`[Test Setup] Unlinking ${provider} from user ${userId}...`);
    // IMPORTANT: Requires direct DB access.
    const { error } = await supabaseAdmin
      .from('identities')
      .delete()
      .match({ user_id: userId, provider: provider });
  
    if (error) {
      console.error(`[Test Setup] Error unlinking ${provider} for user ${userId}:`, error);
      throw error;
    } else {
       console.log(`[Test Setup] Successfully unlinked ${provider} for user ${userId}.`);
    }
}

// TODO: Add function to delete users for cleanup
// export async function deleteTestUser(email: string) { ... } 