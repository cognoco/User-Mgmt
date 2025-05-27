import { SupabaseClient } from '@supabase/supabase-js';
import { AdminService } from '@/core/admin/interfaces';
import type { SearchQuery } from '@/app/api/admin/users/search/route';
import { getServiceSupabase } from '@/lib/database/supabase';

interface SearchResult {
  users: any[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export class DefaultAdminService implements AdminService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = getServiceSupabase();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async listUsers(_params: any): Promise<{ users: any[]; pagination: any }> {
    throw new Error('Not implemented');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getUserById(_id: string): Promise<any | null> {
    throw new Error('Not implemented');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async updateUser(_id: string, _data: Record<string, any>): Promise<any> {
    throw new Error('Not implemented');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async deleteUser(_id: string): Promise<void> {
    throw new Error('Not implemented');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getAuditLogs(_params: any): Promise<{ logs: any[]; pagination: any }> {
    throw new Error('Not implemented');
  }

  async searchUsers(params: SearchQuery): Promise<SearchResult> {
    const {
      query,
      page,
      limit,
      status,
      role,
      dateCreatedStart,
      dateCreatedEnd,
      dateLastLoginStart,
      dateLastLoginEnd,
      sortBy,
      sortOrder,
      teamId,
    } = params;

    const offset = (page - 1) * limit;

    let baseQuery = this.supabase
      .from('profiles')
      .select(
        'id, first_name, last_name, email, user_type, created_at, last_login_at, status, role',
        { count: 'exact' }
      );

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
      console.error('Error searching users:', error);
      throw new Error(`Failed to search users: ${error.message}`);
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      users: users || [],
      pagination: {
        page,
        limit,
        totalCount: count || 0,
        totalPages,
      },
    };
  }
}
