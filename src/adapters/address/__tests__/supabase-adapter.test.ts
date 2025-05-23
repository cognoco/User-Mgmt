import { describe, it, expect, beforeEach } from 'vitest';
import { SupabaseAddressAdapter } from '../supabase-adapter';
import { setTableMockData, resetSupabaseMock } from '@/tests/mocks/supabase';

const SUPABASE_URL = 'http://localhost';
const SUPABASE_KEY = 'anon';

const addressRecord = {
  id: 'addr-1',
  company_id: 'comp-1',
  type: 'billing',
  street_line1: '123 Main',
  street_line2: 'Suite 1',
  city: 'Townsville',
  state: 'TS',
  postal_code: '12345',
  country: 'US',
  is_primary: true,
  validated: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-02T00:00:00Z'
};

describe('SupabaseAddressAdapter', () => {
  beforeEach(() => {
    resetSupabaseMock();
    setTableMockData('company_addresses', { data: [addressRecord], error: null, count: 1 });
  });

  it('retrieves addresses with query', async () => {
    const adapter = new SupabaseAddressAdapter(SUPABASE_URL, SUPABASE_KEY);
    const { addresses, count } = await adapter.getAddresses('comp-1', { page: 1, limit: 10 });
    expect(count).toBe(1);
    expect(addresses[0]?.id).toBe('addr-1');
  });

  it('fetches a single address', async () => {
    const adapter = new SupabaseAddressAdapter(SUPABASE_URL, SUPABASE_KEY);
    const addr = await adapter.getAddress('comp-1', 'addr-1');
    expect(addr?.id).toBe('addr-1');
  });

  it('creates an address', async () => {
    setTableMockData('company_addresses', { data: addressRecord, error: null });
    const adapter = new SupabaseAddressAdapter(SUPABASE_URL, SUPABASE_KEY);
    const result = await adapter.createAddress('comp-1', { type: 'billing', street_line1: '123 Main', postal_code: '12345', city: 'Townsville', country: 'US' });
    expect(result.success).toBe(true);
  });
});
