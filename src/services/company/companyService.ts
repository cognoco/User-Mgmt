import { getServiceSupabase } from '@/lib/database/supabase';
import type { CompanyProfile } from '@/types/company';

export interface CompanyService {
  getProfileByUserId(userId: string): Promise<CompanyProfile | null>;
}

export class DefaultCompanyService implements CompanyService {
  constructor(private supabase = getServiceSupabase()) {}

  async getProfileByUserId(userId: string): Promise<CompanyProfile | null> {
    const { data, error } = await this.supabase
      .from('company_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error(`Error fetching company profile for user ${userId}:`, error);
      throw new Error('Failed to fetch company profile');
    }

    return data as CompanyProfile;
  }
}
