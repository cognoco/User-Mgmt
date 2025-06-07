import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { IAddressDataProvider } from '@/core/address/IAddressDataProvider';
import {
  CompanyAddress,
  AddressCreatePayload,
  AddressUpdatePayload,
  AddressResult,
  AddressQuery
} from '@/core/address/models';

export class SupabaseAddressAdapter implements IAddressDataProvider {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  private map(record: any): CompanyAddress {
    return record as CompanyAddress;
  }

  async createAddress(companyId: string, address: AddressCreatePayload): Promise<AddressResult> {
    try {
      if (address.is_primary) {
        await this.supabase
          .from('company_addresses')
          .update({ is_primary: false })
          .eq('company_id', companyId)
          .eq('type', address.type);
      }
      const { data, error } = await this.supabase
        .from('company_addresses')
        .insert({
          ...address,
          company_id: companyId,
          validated: address.validated ?? false
        })
        .select()
        .single();
      if (error || !data) {
        return { success: false, error: error?.message || 'Failed to create address' };
      }
      return { success: true, address: this.map(data) };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async getAddress(
    companyId: string,
    addressId: string
  ): Promise<CompanyAddress | null> {
    const { data, error } = await this.supabase
      .from('company_addresses')
      .select('*')
      .eq('id', addressId)
      .eq('company_id', companyId)
      .maybeSingle();
    if (error || !data) {
      return null;
    }
    return this.map(data);
  }

  async getAddresses(
    companyId: string,
    query: AddressQuery = {}
  ): Promise<{ addresses: CompanyAddress[]; count: number }> {
    let req = this.supabase
      .from('company_addresses')
      .select('*', { count: 'exact' })
      .eq('company_id', companyId);

    if (query.type) req = req.eq('type', query.type);
    if (typeof query.is_primary === 'boolean') req = req.eq('is_primary', query.is_primary);
    if (typeof query.validated === 'boolean') req = req.eq('validated', query.validated);
    if (query.sortBy) req = req.order(query.sortBy as string, { ascending: query.sortOrder !== 'desc' });
    if (query.limit && query.page) {
      const from = (query.page - 1) * query.limit;
      const to = from + query.limit - 1;
      req = req.range(from, to);
    } else if (query.limit) {
      req = req.limit(query.limit);
    }

    const { data, error, count } = await req;
    const addresses = data ? data.map(r => this.map(r)) : [];
    if (error) {
      return { addresses: [], count: 0 };
    }
    return { addresses, count: count ?? addresses.length };
  }

  async updateAddress(companyId: string, addressId: string, update: AddressUpdatePayload): Promise<AddressResult> {
    try {
      if (update.is_primary) {
        await this.supabase
          .from('company_addresses')
          .update({ is_primary: false })
          .eq('company_id', companyId)
          .eq('type', update.type as string);
      }

      const payload = { ...update, updated_at: new Date().toISOString() };
      if (update.validated === undefined) {
        delete (payload as any).validated;
      }

      const { data, error } = await this.supabase
        .from('company_addresses')
        .update(payload)
        .eq('id', addressId)
        .eq('company_id', companyId)
        .select()
        .single();

      if (error || !data) {
        return { success: false, error: error?.message || 'Failed to update address' };
      }

      return { success: true, address: this.map(data) };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async deleteAddress(companyId: string, addressId: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await this.supabase
      .from('company_addresses')
      .delete()
      .eq('id', addressId)
      .eq('company_id', companyId);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  }
}
