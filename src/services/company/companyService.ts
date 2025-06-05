import { getServiceSupabase } from '@/lib/database/supabase';
import type { CompanyProfile } from '@/types/company';
import { v4 as uuidv4 } from 'uuid';
import dns from 'dns/promises';

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
  getDocument(
    companyId: string,
    documentId: string,
  ): Promise<CompanyDocument | null>;
  deleteDocument(companyId: string, documentId: string): Promise<void>;

  initiateDomainVerification(
    domainId: string,
    userId: string,
  ): Promise<{ domain: string; verificationToken: string }>;

  checkDomainVerification(
    domainId: string,
    userId: string,
  ): Promise<{ verified: boolean; message: string }>;

  initiateProfileDomainVerification(
    userId: string,
  ): Promise<{ domainName: string; verificationToken: string }>;

  checkProfileDomainVerification(
    userId: string,
  ): Promise<{ verified: boolean; message: string }>;
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

  async getDocument(
    companyId: string,
    documentId: string,
  ): Promise<CompanyDocument | null> {
    const { data, error } = await this.supabase
      .from('company_documents')
      .select('*')
      .eq('id', documentId)
      .eq('company_id', companyId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching company document:', error);
      throw new Error('Failed to fetch company document');
    }

    return data as CompanyDocument;
  }

  async deleteDocument(companyId: string, documentId: string): Promise<void> {
    const document = await this.getDocument(companyId, documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    const { error: storageError } = await this.supabase.storage
      .from('company-documents')
      .remove([document.file_path]);

    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
      throw new Error('Failed to delete file');
    }

    const { error } = await this.supabase
      .from('company_documents')
      .delete()
      .eq('id', documentId)
      .eq('company_id', companyId);

    if (error) {
      console.error('Error deleting document record:', error);
      throw new Error('Failed to delete document record');
    }
  }

  async initiateDomainVerification(
    domainId: string,
    userId: string,
  ): Promise<{ domain: string; verificationToken: string }> {
    const { data: domainRecord, error } = await this.supabase
      .from('company_domains')
      .select('*')
      .eq('id', domainId)
      .single();

    if (error || !domainRecord) {
      console.error(`Error fetching domain ${domainId}:`, error);
      throw new Error('Domain not found.');
    }

    const profile = await this.getProfileByUserId(userId);
    if (!profile || profile.id !== domainRecord.company_id) {
      throw new Error('You do not have permission to verify this domain.');
    }

    const verificationToken = `user-management-verification=${uuidv4()}`;

    const { error: updateError } = await this.supabase
      .from('company_domains')
      .update({
        verification_token: verificationToken,
        is_verified: false,
        verification_date: null,
        last_checked: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', domainRecord.id);

    if (updateError) {
      console.error(
        `Error initiating verification for domain ${domainId}:`,
        updateError,
      );
      throw new Error('Failed to update domain with verification token.');
    }

    return { domain: domainRecord.domain, verificationToken };
  }

  async checkDomainVerification(
    domainId: string,
    userId: string,
  ): Promise<{ verified: boolean; message: string }> {
    const { data: domainRecord, error } = await this.supabase
      .from('company_domains')
      .select('*')
      .eq('id', domainId)
      .single();

    if (error || !domainRecord) {
      console.error(`Error fetching domain ${domainId}:`, error);
      throw new Error('Domain not found.');
    }

    const profile = await this.getProfileByUserId(userId);
    if (!profile || profile.id !== domainRecord.company_id) {
      throw new Error('You do not have permission to verify this domain.');
    }

    if (!domainRecord.verification_token) {
      throw new Error('Domain verification has not been initiated.');
    }

    const { domain, verification_token } = domainRecord;
    let isVerified = false;
    let dnsCheckError: string | null = null;

    try {
      const dnsPromise = dns.resolveTxt(domain);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('DNS lookup timeout')), 10000),
      );
      const records = await Promise.race([dnsPromise, timeoutPromise]);

      for (const recordParts of records as string[][]) {
        const recordValue = recordParts.join('');
        if (recordValue === verification_token) {
          isVerified = true;
          break;
        }
      }
    } catch (err: any) {
      if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') {
        dnsCheckError = 'No TXT records found for the domain.';
      } else if (err.message === 'DNS lookup timeout') {
        dnsCheckError = 'DNS lookup timed out. Please try again later.';
      } else {
        dnsCheckError = 'An error occurred during DNS lookup.';
      }
    }

    const { error: updateError } = await this.supabase
      .from('company_domains')
      .update({
        is_verified: isVerified,
        verification_date: isVerified ? new Date().toISOString() : null,
        last_checked: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', domainRecord.id);

    if (updateError) {
      console.error(
        `Error updating domain verification status for ${domain}:`,
        updateError,
      );
      throw new Error('Failed to update domain verification status.');
    }

    if (isVerified) {
      return { verified: true, message: 'Domain successfully verified.' };
    }

    return {
      verified: false,
      message: dnsCheckError || 'Verification token not found in TXT records.',
    };
  }

  async initiateProfileDomainVerification(
    userId: string,
  ): Promise<{ domainName: string; verificationToken: string }> {
    const { data: profile, error } = await this.supabase
      .from('company_profiles')
      .select('id, website')
      .eq('user_id', userId)
      .single();

    if (error || !profile) {
      console.error(`Error fetching company profile for user ${userId}:`, error);
      throw new Error('Failed to fetch company profile.');
    }

    if (!profile.website) {
      throw new Error('Company website URL is not set in the profile.');
    }

    const url = new URL(profile.website);
    const domainName = url.hostname.replace(/^www\./, '');

    const verificationToken = `user-management-verification=${uuidv4()}`;

    const { error: updateError } = await this.supabase
      .from('company_profiles')
      .update({
        domain_name: domainName,
        domain_verification_token: verificationToken,
        domain_verified: false,
        domain_last_checked: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);

    if (updateError) {
      console.error(
        `Error updating company profile for domain verification (user ${userId}):`,
        updateError,
      );
      throw new Error('Failed to update profile with verification token.');
    }

    return { domainName, verificationToken };
  }

  async checkProfileDomainVerification(
    userId: string,
  ): Promise<{ verified: boolean; message: string }> {
    const { data: profile, error } = await this.supabase
      .from('company_profiles')
      .select('id, domain_name, domain_verification_token')
      .eq('user_id', userId)
      .single();

    if (error || !profile) {
      console.error(`Check Domain: Error fetching company profile for user ${userId}:`, error);
      throw new Error('Failed to fetch company profile.');
    }

    if (!profile.domain_name || !profile.domain_verification_token) {
      throw new Error('Domain verification has not been initiated for this company.');
    }

    const { domain_name, domain_verification_token } = profile as any;
    let isVerified = false;
    let dnsCheckError: string | null = null;

    try {
      const records = await dns.resolveTxt(domain_name);
      for (const recordParts of records) {
        const recordValue = recordParts.join('');
        if (recordValue === domain_verification_token) {
          isVerified = true;
          break;
        }
      }
    } catch (err: any) {
      if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') {
        dnsCheckError = 'No TXT records found for the domain.';
      } else {
        dnsCheckError = 'An error occurred during DNS lookup.';
      }
    }

    const { error: updateError } = await this.supabase
      .from('company_profiles')
      .update({
        domain_verified: isVerified,
        domain_last_checked: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);

    if (updateError) {
      console.error(
        `Check Domain: Error updating company profile for verification status (user ${userId}):`,
        updateError,
      );
      throw new Error('Database update failed.');
    }

    if (isVerified) {
      return { verified: true, message: 'Domain successfully verified.' };
    }

    return {
      verified: false,
      message: dnsCheckError || 'Verification token not found in TXT records.',
    };
  }
}
