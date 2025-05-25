import { SessionService } from '@/core/session/interfaces';
import type { SessionInfo } from '@/core/session/models';

/**
 * API-based implementation of {@link SessionService} for client use.
 */
export class ApiSessionService implements SessionService {
  async listUserSessions(_userId: string): Promise<SessionInfo[]> {
    const res = await fetch('/api/session', { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch sessions');
    const data = await res.json();
    return data.sessions ?? data.data?.sessions ?? [];
  }

  async revokeUserSession(_userId: string, sessionId: string): Promise<{ success: boolean; error?: string }> {
    const res = await fetch(`/api/session/${sessionId}`, { method: 'DELETE', credentials: 'include' });
    if (!res.ok) {
      const data = await res.json();
      return { success: false, error: data.error };
    }
    return { success: true };
  }
}

export function getApiSessionService(): SessionService {
  return new ApiSessionService();
}
