import { DefaultSessionService } from './default-session.service';
export { ApiSessionService, getApiSessionService } from './api-session.service';
import type { SessionService } from '@/core/session/interfaces';
import type { SessionDataProvider } from '@/core/session/ISessionDataProvider';

export interface SessionServiceConfig {
  sessionDataProvider: SessionDataProvider;
}

export function createSessionService(config: SessionServiceConfig): SessionService {
  return new DefaultSessionService(config.sessionDataProvider);
}

export default { createSessionService };
