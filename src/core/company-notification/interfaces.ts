import type {
  CompanyNotificationPreference,
  CompanyNotificationRecipient,
  NotificationType,
  NotificationChannel,
} from '@/types/company';

export interface CompanyNotificationService {
  getPreferencesForUser(userId: string): Promise<CompanyNotificationPreference[]>;

  createPreference(
    userId: string,
    data: {
      companyId: string;
      notificationType: NotificationType;
      enabled: boolean;
      channel: NotificationChannel;
    }
  ): Promise<CompanyNotificationPreference>;

  updatePreference(
    userId: string,
    preferenceId: string,
    updates: { enabled?: boolean; channel?: NotificationChannel }
  ): Promise<CompanyNotificationPreference>;

  addRecipient(
    userId: string,
    data: {
      companyId: string;
      preferenceId?: string;
      email: string;
      isAdmin: boolean;
    }
  ): Promise<{ recipients: CompanyNotificationRecipient[] }>;

  removeRecipient(userId: string, recipientId: string): Promise<void>;
}
