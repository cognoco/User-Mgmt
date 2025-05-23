/**
 * Supabase Session Provider Implementation
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SessionInfo } from '../../core/session/models';
import type { ISessionDataProvider } from '@/core/session/ISessionDataProvider';
export class SupabaseSessionProvider implements ISessionDataProvider {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async listUserSessions(userId: string): Promise<SessionInfo[]> {
    const { data, error } = await this.supabase.auth.admin.listUserSessions(userId);
    if (error) {
      throw new Error(error.message);
    }
    return (data || []).map((session: any) => ({
      id: session.id,
      createdAt: session.created_at,
      lastActiveAt: session.user_metadata?.last_activity,
      ipAddress: session.ip_address,
      userAgent: session.user_agent,
      // Preserve original metadata for policy checks
      user_metadata: session.user_metadata,
      created_at: session.created_at,
    })) as any;
  }

  async deleteUserSession(userId: string, sessionId: string): Promise<void> {
    const { error } = await this.supabase.auth.admin.deleteUserSession(userId, sessionId);
    if (error) {
      throw new Error(error.message);
    }
  }
}
