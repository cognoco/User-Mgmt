import { SessionService } from '@/core/session/interfaces';
import type { SessionInfo } from '@/core/session/models';
import type { SessionDataProvider } from '@/core/session/ISessionDataProvider';

export class DefaultSessionService implements SessionService {
  constructor(private provider: SessionDataProvider) {}

  async listUserSessions(userId: string): Promise<SessionInfo[]> {
    return this.provider.listUserSessions(userId);
  }

  async revokeUserSession(userId: string, sessionId: string): Promise<{ success: boolean; error?: string }> {
    return this.provider.deleteUserSession(userId, sessionId);
  }
}
