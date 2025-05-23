/**
 * Default GDPR Service Implementation
 */
import { GdprService } from '@/core/gdpr/interfaces';
import { UserDataExport, AccountDeletionResult } from '@/core/gdpr/models';
import type { GdprDataProvider } from '@/core/gdpr/IGdprDataProvider';

export class DefaultGdprService implements GdprService {
  constructor(private provider: GdprDataProvider) {}

  exportUserData(userId: string): Promise<UserDataExport | null> {
    return this.provider.generateUserExport(userId);
  }

  deleteAccount(userId: string): Promise<AccountDeletionResult> {
    return this.provider.deleteUserData(userId);
  }
}
