import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { IAddressDataProvider } from '../../core/address/IAddressDataProvider';
import {
  CompanyAddress,
  AddressCreatePayload,
  AddressUpdatePayload,
  AddressResult
} from '../../core/address/models';

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

  async getAddresses(companyId: string): Promise<CompanyAddress[]> {
    const { data } = await this.supabase
      .from('company_addresses')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    return (data ?? []) as CompanyAddress[];
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
