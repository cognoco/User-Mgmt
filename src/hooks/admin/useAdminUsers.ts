import { useState } from 'react';
import { useApi } from '@/hooks/core/useApi';

interface SearchParams {
  query?: string;
  page?: number;
  limit?: number;
  status?: 'active' | 'inactive' | 'suspended' | 'all';
  role?: string;
  dateCreatedStart?: Date;
  dateCreatedEnd?: Date;
  dateLastLoginStart?: Date;
  dateLastLoginEnd?: Date;
  sortBy?: 'name' | 'email' | 'createdAt' | 'lastLoginAt' | 'status';
  sortOrder?: 'asc' | 'desc';
  teamId?: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  role: string;
  createdAt: string;
  lastLoginAt: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

interface SearchResponse {
  users: User[];
  pagination: Pagination;
}

export function useAdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const { isLoading, error, fetchApi } = useApi();

  const searchUsers = async (params: SearchParams) => {
    const formattedParams: Record<string, string> = {};
    Object.entries({
      ...params,
      dateCreatedStart: params.dateCreatedStart?.toISOString(),
      dateCreatedEnd: params.dateCreatedEnd?.toISOString(),
      dateLastLoginStart: params.dateLastLoginStart?.toISOString(),
      dateLastLoginEnd: params.dateLastLoginEnd?.toISOString(),
    }).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        formattedParams[k] = String(v);
      }
    });
    const query = new URLSearchParams(formattedParams).toString();
    const result = await fetchApi<SearchResponse>(`/api/admin/users/search?${query}`);
    if (result) {
      setUsers(result.users);
      setPagination(result.pagination);
    }
  };

  return { users, pagination, isLoading, error, searchUsers };
}
