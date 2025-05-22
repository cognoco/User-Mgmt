import { SessionService } from '@/core/session/interfaces';
import type { SessionInfo } from '@/core/session/models';
import type { AxiosInstance } from 'axios';
import type { SessionDataProvider } from '@/adapters/session/interfaces';

export class DefaultSessionService implements SessionService {
  constructor(
    private apiClient: AxiosInstance,
    // Data provider kept for future use
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _provider?: SessionDataProvider
  ) {}

  async listUserSessions(_userId: string): Promise<SessionInfo[]> {
    const response = await this.apiClient.get('/api/session');
    return response.data.sessions || [];
  }

  async revokeUserSession(_userId: string, sessionId: string): Promise<void> {
    await this.apiClient.delete(`/api/session/${sessionId}`);
  }
}
