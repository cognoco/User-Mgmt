import { getServiceSupabase } from '@/lib/database/supabase';
import type { CompanyProfile } from '@/types/company';

import type {
  CompanyDomain,
  CompanyDocument,
} from '@/types/company';

export interface CompanyService {
  getProfileByUserId(userId: string): Promise<CompanyProfile | null>;
  createProfile(
    userId: string,
    data: Omit<CompanyProfile, 'id' | 'user_id' | 'status' | 'verified' | 'created_at' | 'updated_at'>,
  ): Promise<CompanyProfile>;
  updateProfile(id: string, data: Partial<CompanyProfile>): Promise<CompanyProfile>;
  deleteProfile(id: string): Promise<void>;

  listDomains(companyId: string): Promise<CompanyDomain[]>;
  createDomain(
    companyId: string,
    domain: string,
    isPrimary: boolean,
  ): Promise<CompanyDomain>;
  getDomainById(id: string): Promise<CompanyDomain | null>;
  updateDomain(id: string, updates: Partial<CompanyDomain>): Promise<CompanyDomain>;
  deleteDomain(id: string): Promise<void>;

  uploadDocument(
    companyId: string,
    filePath: string,
    meta: {
      type: string;
      filename: string;
      mimeType: string;
      size: number;
      uploadedBy: string;
    },
  ): Promise<CompanyDocument>;
  listDocuments(
    companyId: string,
    options: { start: number; end: number; type?: string },
  ): Promise<{ documents: CompanyDocument[]; count: number | null }>;
  createSignedUrl(path: string, expiresIn: number): Promise<string | null>;
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

  async createProfile(
    userId: string,
    data: Omit<CompanyProfile, 'id' | 'user_id' | 'status' | 'verified' | 'created_at' | 'updated_at'>,
  ): Promise<CompanyProfile> {
    const { data: profile, error } = await this.supabase
      .from('company_profiles')
      .insert({
        ...data,
        user_id: userId,
        status: 'pending',
        verified: false,
      })
      .select('*')
      .single();

    if (error || !profile) {
      console.error('Error creating company profile:', error);
      throw new Error('Failed to create company profile');
    }

    return profile as CompanyProfile;
  }

  async updateProfile(
    id: string,
    data: Partial<CompanyProfile>,
  ): Promise<CompanyProfile> {
    const { data: profile, error } = await this.supabase
      .from('company_profiles')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (error || !profile) {
      console.error('Error updating company profile:', error);
      throw new Error('Failed to update company profile');
    }

    return profile as CompanyProfile;
  }

  async deleteProfile(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('company_profiles')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Error deleting company profile:', error);
      throw new Error('Failed to delete company profile');
    }
  }

  async listDomains(companyId: string): Promise<CompanyDomain[]> {
    const { data, error } = await this.supabase
      .from('company_domains')
      .select('*')
      .eq('company_id', companyId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching domains:', error);
      throw new Error('Failed to fetch domains');
    }
    return (data || []) as CompanyDomain[];
  }

  async createDomain(
    companyId: string,
    domain: string,
    isPrimary: boolean,
  ): Promise<CompanyDomain> {
    const { data, error } = await this.supabase
      .from('company_domains')
      .insert({
        company_id: companyId,
        domain,
        is_primary: isPrimary,
        is_verified: false,
        verification_method: 'dns_txt',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error || !data) {
      console.error('Error creating domain:', error);
      throw new Error('Failed to create domain');
    }

    return data as CompanyDomain;
  }

  async getDomainById(id: string): Promise<CompanyDomain | null> {
    const { data, error } = await this.supabase
      .from('company_domains')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching domain:', error);
      throw new Error('Failed to fetch domain');
    }
    return data as CompanyDomain;
  }

  async updateDomain(
    id: string,
    updates: Partial<CompanyDomain>,
  ): Promise<CompanyDomain> {
    const { data, error } = await this.supabase
      .from('company_domains')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) {
      console.error('Error updating domain:', error);
      throw new Error('Failed to update domain');
    }

    return data as CompanyDomain;
  }

  async deleteDomain(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('company_domains')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Error deleting domain:', error);
      throw new Error('Failed to delete domain');
    }
  }

  async uploadDocument(
    companyId: string,
    filePath: string,
    meta: {
      type: string;
      filename: string;
      mimeType: string;
      size: number;
      uploadedBy: string;
    },
  ): Promise<CompanyDocument> {
    const { error: uploadError } = await this.supabase.storage
      .from('company-documents')
      .upload(filePath, Buffer.from(''), {
        contentType: meta.mimeType,
        upsert: false,
      });
    if (uploadError) {
      console.error('File upload error:', uploadError);
      throw new Error('Failed to upload file');
    }

    const { data, error } = await this.supabase
      .from('company_documents')
      .insert({
        company_id: companyId,
        type: meta.type,
        filename: meta.filename,
        file_path: filePath,
        mime_type: meta.mimeType,
        size_bytes: meta.size,
        uploaded_by: meta.uploadedBy,
        status: 'pending',
      })
      .select('*')
      .single();

    if (error || !data) {
      await this.supabase.storage.from('company-documents').remove([filePath]);
      console.error('Document record creation error:', error);
      throw new Error('Failed to create document record');
    }

    return data as CompanyDocument;
  }

  async listDocuments(
    companyId: string,
    options: { start: number; end: number; type?: string },
  ): Promise<{ documents: CompanyDocument[]; count: number | null }> {
    let query = this.supabase
      .from('company_documents')
      .select('*', { count: 'exact' })
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (options.type) {
      query = query.eq('type', options.type);
    }

    const { data, error, count } = await query.range(
      options.start,
      options.end,
    );

    if (error) {
      console.error('Error fetching documents:', error);
      throw new Error('Failed to fetch documents');
    }

    return {
      documents: (data || []) as CompanyDocument[],
      count: count ?? null,
    };
  }

  async createSignedUrl(path: string, expiresIn: number): Promise<string | null> {
    const { data, error } = await this.supabase.storage
      .from('company-documents')
      .createSignedUrl(path, expiresIn);
    if (error) {
      console.error('Error generating signed url:', error);
      return null;
    }
    return data?.signedUrl ?? null;
  }
}
