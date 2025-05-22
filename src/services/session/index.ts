import { DefaultSessionService } from './default-session.service';
import type { SessionService } from '@/core/session/interfaces';
import type { AxiosInstance } from 'axios';
import type { SessionDataProvider } from '@/adapters/session/interfaces';

export interface SessionServiceConfig {
  apiClient: AxiosInstance;
  sessionDataProvider?: SessionDataProvider;
}

export function createSessionService(config: SessionServiceConfig): SessionService {
  return new DefaultSessionService(config.apiClient, config.sessionDataProvider);
}

export default { createSessionService };
