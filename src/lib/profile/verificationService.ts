import { createClient } from '@/lib/supabase';

export type ProfileVerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface ProfileVerification {
  status: ProfileVerificationStatus;
  admin_feedback?: string | null;
  document_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

const supabase = createClient();

export async function getProfileVerificationStatus(userId: string): Promise<ProfileVerification> {
  const { data, error } = await supabase
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
  };
}

export async function requestProfileVerification(userId: string, documentUrl?: string): Promise<ProfileVerification> {
  // Upsert: if a request exists, update; else, insert new
  const { data, error } = await supabase
    .from('profile_verification_requests')
    .upsert({
      user_id: userId,
      status: 'pending',
      document_url: documentUrl || null,
      admin_feedback: null,
      updated_at: new Date().toISOString(),
    }, { onConflict: ['user_id'] })
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
  };
}
