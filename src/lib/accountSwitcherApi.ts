// AccountSwitcher API abstraction for Supabase (easy to swap for other backends)
import { supabase } from './supabase';

// Types
export interface Account {
  id: string;
  name: string;
  type: 'personal' | 'organization';
  avatar_url?: string | null;
}

export interface OrganizationMember {
  id: string;
  name: string;
  role: string;
}

// Fetch all accounts for the current user
export async function fetchAccounts(): Promise<Account[]> {
  // Replace with your actual Supabase query
  const { data, error } = await supabase.from('accounts').select('*');
  if (error) throw error;
  return data;
}

// Switch to a different account
export async function switchAccount(accountId: string): Promise<void> {
  const { error } = await supabase.rpc('switch_account', { account_id: accountId });
  if (error) throw error;
}

// Create a new organization
export async function createOrganization(name: string, ownerId: string): Promise<Account> {
  const { data, error } = await supabase.from('accounts').insert({
    name,
    type: 'organization',
    owner_id: ownerId,
  }).select().single();
  if (error) throw error;
  return data;
}

// Fetch members of an organization
export async function fetchOrganizationMembers(orgId: string): Promise<OrganizationMember[]> {
  const { data, error } = await supabase.from('organization_members').select('*').eq('organization_id', orgId);
  if (error) throw error;
  return data;
}

// Leave an organization
export async function leaveOrganization(orgId: string): Promise<void> {
  const { error } = await supabase.rpc('leave_organization', { organization_id: orgId });
  if (error) throw error;
} 