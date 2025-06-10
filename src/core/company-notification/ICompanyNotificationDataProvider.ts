import type {
  CompanyNotificationPreference,
  CompanyNotificationRecipient,
  NotificationType,
  NotificationChannel,
} from '@/types/company';

/**
 * Data provider interface for company notification preferences and recipients.
 *
 * Implementations handle persistence of notification preferences and recipient
 * data in a storage system such as Supabase. Business rules should live in the
 * service layer; providers only perform CRUD operations and simple validation.
 */
export interface ICompanyNotificationDataProvider {
  /**
   * Fetch all notification preferences for the company associated with the user.
   */
  getPreferencesForUser(userId: string): Promise<CompanyNotificationPreference[]>;

  /**
   * Create or update a notification preference for a company.
   */
  createPreference(
    userId: string,
    data: {
      companyId: string;
      notificationType: NotificationType;
      enabled: boolean;
      channel: NotificationChannel;
    }
  ): Promise<CompanyNotificationPreference>;

  /**
   * Update an existing preference.
   */
  updatePreference(
    userId: string,
    preferenceId: string,
    updates: { enabled?: boolean; channel?: NotificationChannel }
  ): Promise<CompanyNotificationPreference>;

  /**
   * Add a notification recipient.
   */
  addRecipient(
    userId: string,
    data: {
      companyId: string;
      preferenceId?: string;
      email: string;
      isAdmin: boolean;
    }
  ): Promise<{ recipients: CompanyNotificationRecipient[] }>;

  /**
   * Remove a notification recipient.
   */
  removeRecipient(userId: string, recipientId: string): Promise<void>;
}
