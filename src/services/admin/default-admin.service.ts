import { SupabaseClient } from '@supabase/supabase-js';
import { AdminService } from '@/core/admin/interfaces';
import type { SearchQuery } from '@/app/api/admin/users/search/route';
import { getServiceSupabase } from '@/lib/database/supabase';
import { objectsToCSV } from '@/utils/export/csvExport';
import { formatJSONForExport } from '@/utils/export/jsonExport';
import { SearchCache } from '@/utils/cache/searchCache';

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
  private searchCache: SearchCache<SearchResult>;

  constructor() {
    this.supabase = getServiceSupabase();
    this.searchCache = new SearchCache<SearchResult>(60000);
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
    const cacheKey = this.searchCache.generateKey(params);
    const cached = this.searchCache.get(cacheKey);
    if (cached) {
      console.log('Using cached search result');
      return cached;
    }

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

    const result = {
      users: users || [],
      pagination: {
        page,
        limit,
        totalCount: count || 0,
        totalPages,
      },
    };

    this.searchCache.set(cacheKey, result);
    return result;
  }

  async exportUsers(params: SearchQuery, format: 'csv' | 'json'): Promise<{ data: string; filename: string }> {
    const { users } = await this.searchUsers({ ...params, page: 1, limit: 10000 });
    const timestamp = new Date().toISOString().split('T')[0];
    if (format === 'csv') {
      const csv = objectsToCSV(users, [
        { key: 'id', header: 'ID' },
        { key: 'firstName', header: 'First Name' },
        { key: 'lastName', header: 'Last Name' },
        { key: 'email', header: 'Email' },
        { key: 'status', header: 'Status' },
        { key: 'role', header: 'Role' },
        { key: 'createdAt', header: 'Created At', format: (v) => (v ? new Date(v).toLocaleString() : '') },
        { key: 'lastLoginAt', header: 'Last Login', format: (v) => (v ? new Date(v).toLocaleString() : 'Never') },
      ]);
      return { data: csv, filename: `user-export-${timestamp}.csv` };
    }

    const json = formatJSONForExport(users, {
      pretty: true,
      transform: (u) => ({
        ...u,
        createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : null,
        lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : null,
      }),
    });
    return { data: json, filename: `user-export-${timestamp}.json` };
  }

  invalidateUserSearchCache(): void {
    this.searchCache.invalidateAll();
  }

  invalidateUserCache(_userId: string): void {
    this.searchCache.invalidateAll();
  }
}
