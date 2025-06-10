import type { User, CreateUserDto } from '@/types/user';
import { UserType } from '@/types/userType';
import { getServiceSupabase } from '@/lib/database/supabase';
import type { IUserRepository } from '@/repositories/interfaces/IUserRepository';

/**
 * Supabase implementation of {@link IUserRepository}.
 *
 * This repository uses the service role Supabase client for all database
 * operations to ensure it can run in server-side contexts with full
 * privileges. The underlying database structure may evolve, so mapping
 * between database rows and domain models is centralized here.
 */
export class SupabaseUserRepository implements IUserRepository {
  /** Map database record to {@link User} domain model */
  private mapDbUser(record: any): User {
    return {
      id: record.id,
      email: record.email,
      username: record.username ?? undefined,
      firstName: record.first_name ?? undefined,
      lastName: record.last_name ?? undefined,
      fullName: record.full_name ?? record.display_name ?? undefined,
      isActive: record.is_active ?? record.status !== 'inactive',
      isVerified: record.is_verified ?? false,
      userType: (record.user_type || record.account_type || UserType.PRIVATE) as UserType,
      company: record.company ?? record.account_data ?? undefined,
      createdAt: record.created_at ?? undefined,
      updatedAt: record.updated_at ?? undefined,
      lastLogin: record.last_login_at ?? record.last_login ?? undefined,
      metadata: record.metadata ?? record.user_metadata ?? undefined,
    };
  }

  async findById(id: string): Promise<User | null> {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return this.mapDbUser(data);
  }

  async findByEmail(email: string): Promise<User | null> {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return this.mapDbUser(data);
  }

  async create(data: CreateUserDto): Promise<User> {
    const supabase = getServiceSupabase();
    const now = new Date().toISOString();
    const { data: created, error } = await supabase
      .from('profiles')
      .insert({
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        metadata: data.metadata ?? {},
        created_at: now,
        updated_at: now,
      })
      .select('*')
      .single();

    if (error || !created) {
      throw new Error(error?.message || 'Failed to create user');
    }

    return this.mapDbUser(created);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const supabase = getServiceSupabase();
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };

    if (data.email !== undefined) updates.email = data.email;
    if (data.firstName !== undefined) updates.first_name = data.firstName;
    if (data.lastName !== undefined) updates.last_name = data.lastName;
    if (data.fullName !== undefined) updates.full_name = data.fullName;
    if (data.isActive !== undefined) updates.is_active = data.isActive;
    if (data.userType !== undefined) updates.user_type = data.userType;
    if (data.company !== undefined) updates.account_data = data.company;
    if (data.metadata !== undefined) updates.metadata = data.metadata;

    const { data: updated, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error || !updated) {
      throw new Error(error?.message || 'Failed to update user');
    }

    return this.mapDbUser(updated);
  }
}
