import { GdprService } from '@/core/gdpr/interfaces';
import { DefaultGdprService } from './default-gdpr.service';
import type { GdprDataProvider } from '@/adapters/gdpr/interfaces';

export interface GdprServiceConfig {
  gdprDataProvider: GdprDataProvider;
}

export function createGdprService(config: GdprServiceConfig): GdprService {
  return new DefaultGdprService(config.gdprDataProvider);
}

export default {
  createGdprService
};
