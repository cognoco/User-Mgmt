/**
 * Supabase GDPR Adapter Implementation
 *
 * Implements the GdprDataProvider interface using Supabase.
 * The implementation is intentionally simple and focuses on demonstrating
 * how the adapter pattern can be used for GDPR-related operations.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { GdprDataProvider } from './interfaces';
import { UserDataExport, AccountDeletionResult } from '../../core/gdpr/models';

export class SupabaseGdprAdapter implements GdprDataProvider {
  private supabase: SupabaseClient;

  constructor(private supabaseUrl: string, private supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async generateUserExport(userId: string): Promise<UserDataExport | null> {
    // In a real implementation you would gather data from various tables.
    // Here we fetch the auth user and return a minimal payload.
    const { data, error } = await this.supabase.auth.admin.getUserById(userId);
    if (error || !data) {
      return null;
    }

    const exportData = {
      userId: data.id,
      email: data.email,
      createdAt: data.created_at,
      lastSignInAt: data.last_sign_in_at
    };

    const filename = `user_data_export_${data.id}_${Date.now()}.json`;
    return { userId: data.id, filename, data: exportData };
  }

  async deleteUserData(userId: string): Promise<AccountDeletionResult> {
    try {
      // Real implementation would remove records from all related tables
      // and potentially delete the auth user. This is a mock.
      console.log(`Mock deleting user data for ${userId}`);
      return { success: true, message: 'Account deletion initiated (mock).' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Deletion failed' };
    }
  }
}
