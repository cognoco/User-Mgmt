import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { IConsentDataProvider } from '@/core/consent/IConsentDataProvider';
import type { UserConsent, ConsentUpdatePayload } from '@/core/consent/models';

export class SupabaseConsentProvider implements IConsentDataProvider {
  private supabase: SupabaseClient;

  constructor(private supabaseUrl: string, private supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async getUserConsent(userId: string): Promise<UserConsent | null> {
    const { data, error } = await this.supabase
      .from('user_consents')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      userId: data.user_id,
      marketing: data.marketing,
      updatedAt: data.updated_at,
    };
  }

  async saveUserConsent(
    userId: string,
    payload: ConsentUpdatePayload
  ): Promise<{ success: boolean; consent?: UserConsent; error?: string }> {
    const record = {
      user_id: userId,
      marketing: payload.marketing,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('user_consents')
      .upsert(record, { onConflict: 'user_id' })
      .select()
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || 'Failed to save consent' };
    }

    return {
      success: true,
      consent: {
        userId: data.user_id,
        marketing: data.marketing,
        updatedAt: data.updated_at,
      },
    };
  }
}

export default SupabaseConsentProvider;
