import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { IAuditDataProvider } from '@/core/audit/IAuditDataProvider';
import { AuditLogEntry, AuditLogQuery } from '@/core/audit/models';

export class SupabaseAuditAdapter implements IAuditDataProvider {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  private mapDbLog(record: any): AuditLogEntry {
    return {
      id: record.id.toString(),
      createdAt: record.created_at,
      userId: record.user_id || undefined,
      action: record.action,
      status: record.status,
      ipAddress: record.ip_address || undefined,
      userAgent: record.user_agent || undefined,
      targetResourceType: record.target_resource_type || undefined,
      targetResourceId: record.target_resource_id || undefined,
      details: record.details || undefined,
    };
  }

  async getUserActionLogs(
    query: AuditLogQuery
  ): Promise<{ logs: AuditLogEntry[]; count: number }> {
    let q = this.supabase
      .from('user_actions_log')
      .select('*', { count: 'exact' });

    if (query.userId) q = q.eq('user_id', query.userId);
    if (query.startDate) q = q.gte('created_at', query.startDate);
    if (query.endDate) q = q.lte('created_at', query.endDate);
    if (query.action) q = q.eq('action', query.action);
    if (query.status) q = q.eq('status', query.status);
    if (query.resourceType) q = q.eq('target_resource_type', query.resourceType);
    if (query.resourceId) q = q.eq('target_resource_id', query.resourceId);
    if (query.ipAddress) q = q.ilike('ip_address', `%${query.ipAddress}%`);
    if (query.userAgent) q = q.ilike('user_agent', `%${query.userAgent}%`);
    if (query.search) {
      q = q.or(
        `action.ilike.%${query.search}%,details::text.ilike.%${query.search}%,error.ilike.%${query.search}%,target_resource_id.ilike.%${query.search}%,target_resource_type.ilike.%${query.search}%`
      );
    }

    const sortBy = query.sortBy || 'created_at';
    const ascending = query.sortOrder === 'asc';

    q = q.order(sortBy, { ascending }).range(
      (query.page - 1) * query.limit,
      query.page * query.limit - 1
    );

    const { data, error, count } = await q;
    if (error) {
      throw new Error(error.message);
    }

    const logs = (data || []).map((r: any) => this.mapDbLog(r));
    return { logs, count: count ?? logs.length };
  }
}
