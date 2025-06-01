import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { IAdminDataProvider } from '@/core/admin/IAdminDataProvider';
import type { ListUsersParams, SearchUsersParams } from '@/core/admin/interfaces';
import type { PaginationMeta } from '@/lib/api/common/response-formatter';
import type { UserProfile } from '@/core/user/models';

export class SupabaseAdminProvider implements IAdminDataProvider {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async listUsers(_params: ListUsersParams): Promise<{ users: UserProfile[]; pagination: PaginationMeta }> {
    throw new Error('Not implemented');
  }

  async getUserById(_id: string): Promise<UserProfile | null> {
    throw new Error('Not implemented');
  }

  async updateUser(_id: string, _data: Partial<UserProfile>): Promise<UserProfile> {
    throw new Error('Not implemented');
  }

  async deleteUser(_id: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async getAuditLogs(_query: any): Promise<{ logs: any[]; pagination: PaginationMeta }> {
    throw new Error('Not implemented');
  }

  async searchUsers(params: SearchUsersParams): Promise<{ users: UserProfile[]; pagination: PaginationMeta }> {
    const {
      query,
      page = 1,
      limit = 10,
      status,
      role,
      dateCreatedStart,
      dateCreatedEnd,
      dateLastLoginStart,
      dateLastLoginEnd,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      teamId,
    } = params;

    const offset = (page - 1) * limit;

    let baseQuery = this.supabase
      .from('profiles')
      .select('id, first_name, last_name, email, user_type, created_at, last_login_at, status, role', { count: 'exact' });

    if (query && query.trim() !== '') {
      baseQuery = baseQuery.or(
        `first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`
      );
    }
    if (status && status !== 'all') {
      baseQuery = baseQuery.eq('status', status);
    }
    if (role) {
      baseQuery = baseQuery.eq('role', role);
    }
    if (dateCreatedStart) {
      baseQuery = baseQuery.gte('created_at', dateCreatedStart);
    }
    if (dateCreatedEnd) {
      baseQuery = baseQuery.lte('created_at', dateCreatedEnd);
    }
    if (dateLastLoginStart) {
      baseQuery = baseQuery.gte('last_login_at', dateLastLoginStart);
    }
    if (dateLastLoginEnd) {
      baseQuery = baseQuery.lte('last_login_at', dateLastLoginEnd);
    }
    if (teamId) {
      baseQuery = baseQuery.eq('team_id', teamId);
    }

    baseQuery = baseQuery.order(sortBy === 'name' ? 'first_name' : sortBy, {
      ascending: sortOrder === 'asc',
    });

    baseQuery = baseQuery.range(offset, offset + limit - 1);

    const { data: users, error, count } = await baseQuery;

    if (error) {
      throw new Error(error.message);
    }

    const pagination: PaginationMeta = {
      page,
      pageSize: limit,
      totalItems: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      hasNextPage: page < Math.ceil((count || 0) / limit),
      hasPreviousPage: page > 1,
    };

    return { users: (users as any[]) || [], pagination };
  }
} 