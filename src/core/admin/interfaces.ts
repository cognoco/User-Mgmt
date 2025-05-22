import { PaginationMeta } from '@/lib/api/common/response-formatter';

export interface ListUsersParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AuditLogQuery {
  page: number;
  limit: number;
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: string;
  endDate?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any;
}

export interface AdminService {
  listUsers(params: ListUsersParams): Promise<{ users: any[]; pagination: PaginationMeta }>;
  getUserById(id: string): Promise<any | null>;
  updateUser(id: string, data: Record<string, any>): Promise<any>;
  deleteUser(id: string): Promise<void>;
  getAuditLogs(params: AuditLogQuery): Promise<{ logs: any[]; pagination: PaginationMeta }>;
}
