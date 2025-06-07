import { getServiceSupabase } from '@/lib/database/supabase';
import type { Profile } from '@/types/database';
import type { ProfileService } from '@/core/profile/interfaces';

export class DefaultProfileService implements ProfileService {
  constructor(private supabase = getServiceSupabase()) {}

  async getProfileByUserId(userId: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('userId', userId)
      .single();

    if (error) {
      if ((error as any).code === 'PGRST116') return null;
      throw new Error('Failed to fetch profile');
    }

    return data as Profile;
  }

  async updateProfileByUserId(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await this.supabase
      .from('profiles')
      .update({ ...updates, updatedAt: new Date().toISOString() })
      .eq('userId', userId)
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Failed to update profile');
    }

    return data as Profile;
  }
}
