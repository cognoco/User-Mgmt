import { getServiceSupabase } from '@/lib/database/supabase';
import type { ProfileVerification } from '@/types/profile';
import type { ProfileVerificationService } from '@/core/profileVerification/interfaces';

export class DefaultProfileVerificationService implements ProfileVerificationService {
  constructor(private supabase = getServiceSupabase()) {}

  async getStatus(userId: string): Promise<ProfileVerification> {
    const { data, error } = await this.supabase
      .from('profile_verification_requests')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return { status: 'unverified' };
    }

    return {
      status: data.status,
      admin_feedback: data.admin_feedback,
      document_url: data.document_url,
      created_at: data.created_at,
      updated_at: data.updated_at,
    } as ProfileVerification;
  }

  async requestVerification(userId: string, document?: File): Promise<ProfileVerification> {
    let documentUrl: string | undefined;

    if (document) {
      const ext = (document.name || 'bin').split('.').pop();
      const filePath = `profile-verification/${userId}/${Date.now()}.${ext}`;
      const { error } = await this.supabase.storage.from('profile-verification').upload(filePath, document, {
        cacheControl: '3600',
        upsert: true,
      });
      if (error) {
        throw new Error('Failed to upload document');
      }
      documentUrl = this.supabase.storage.from('profile-verification').getPublicUrl(filePath).publicUrl;
    }

    const { data, error } = await this.supabase
      .from('profile_verification_requests')
      .upsert(
        {
          user_id: userId,
          status: 'pending',
          document_url: documentUrl || null,
          admin_feedback: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: ['user_id'] },
      )
      .select('*')
      .single();

    if (error || !data) {
      throw new Error('Failed to request verification');
    }

    return {
      status: data.status,
      admin_feedback: data.admin_feedback,
      document_url: data.document_url,
      created_at: data.created_at,
      updated_at: data.updated_at,
    } as ProfileVerification;
  }
}
