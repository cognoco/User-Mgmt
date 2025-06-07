import { getServiceSupabase } from '@/lib/database/supabase';
import type {
  CompanyNotificationPreference,
  CompanyNotificationRecipient,
  NotificationType,
  NotificationChannel,
} from '@/types/company';
import type { CompanyNotificationService } from '@/core/companyNotification/interfaces'217;

export class DefaultCompanyNotificationService implements CompanyNotificationService {
  constructor(private supabase = getServiceSupabase()) {}

  async getPreferencesForUser(userId: string): Promise<CompanyNotificationPreference[]> {
    const { data: company, error: profileError } = await this.supabase
      .from('company_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();
    if (profileError || !company) {
      throw new Error('Failed to fetch company profile');
    }

    const { data, error } = await this.supabase
      .from('company_notification_preferences')
      .select('*, recipients:company_notification_recipients(*)')
      .eq('company_id', company.id);

    if (error) {
      throw new Error('Failed to fetch notification preferences');
    }
    return (data || []) as CompanyNotificationPreference[];
  }

  async createPreference(
    userId: string,
    data: {
      companyId: string;
      notificationType: NotificationType;
      enabled: boolean;
      channel: NotificationChannel;
    }
  ): Promise<CompanyNotificationPreference> {
    const { data: company, error: profileError } = await this.supabase
      .from('company_profiles')
      .select('id')
      .eq('id', data.companyId)
      .eq('user_id', userId)
      .single();
    if (profileError || !company) {
      throw new Error('You do not have permission to update notification preferences for this company');
    }

    const { data: existing } = await this.supabase
      .from('company_notification_preferences')
      .select('id')
      .eq('company_id', data.companyId)
      .eq('notification_type', data.notificationType)
      .maybeSingle();

    const effectiveEnabled = data.notificationType === 'security_alert' ? true : data.enabled;
    const effectiveChannel = data.notificationType === 'security_alert' ? 'both' : data.channel;

    if (existing) {
      const { data: updated, error } = await this.supabase
        .from('company_notification_preferences')
        .update({
          enabled: effectiveEnabled,
          channel: effectiveChannel,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select('*')
        .single();
      if (error || !updated) {
        throw new Error('Failed to update notification preference');
      }
      return updated as CompanyNotificationPreference;
    }

    const { data: newPref, error: insertError } = await this.supabase
      .from('company_notification_preferences')
      .insert({
        company_id: data.companyId,
        notification_type: data.notificationType,
        enabled: effectiveEnabled,
        channel: effectiveChannel,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (insertError || !newPref) {
      throw new Error('Failed to create notification preference');
    }

    await this.supabase.from('company_notification_recipients').insert({
      preference_id: newPref.id,
      user_id: userId,
      is_admin: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return newPref as CompanyNotificationPreference;
  }

  async updatePreference(
    userId: string,
    preferenceId: string,
    updates: { enabled?: boolean; channel?: NotificationChannel }
  ): Promise<CompanyNotificationPreference> {
    const { data: pref, error } = await this.supabase
      .from('company_notification_preferences')
      .select('*, company:company_profiles!inner(id, user_id)')
      .eq('id', preferenceId)
      .single();
    if (error || !pref) {
      throw new Error('Notification preference not found');
    }
    if (pref.company.user_id !== userId) {
      throw new Error('You do not have permission to update this notification preference');
    }

    if (pref.notification_type === 'security_alert') {
      if (updates.enabled === false) {
        throw new Error('Security alert notifications cannot be disabled.');
      }
      if (updates.channel && updates.channel !== 'both') {
        throw new Error('Security alert notifications must use both email and in-app channels.');
      }
    }

    const { data: updated, error: updateError } = await this.supabase
      .from('company_notification_preferences')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', preferenceId)
      .select('*')
      .single();
    if (updateError || !updated) {
      throw new Error('Failed to update notification preference');
    }
    return updated as CompanyNotificationPreference;
  }

  async addRecipient(
    userId: string,
    data: { companyId: string; preferenceId?: string; email: string; isAdmin: boolean }
  ): Promise<{ recipients: CompanyNotificationRecipient[] }> {
    const { data: company, error: profileError } = await this.supabase
      .from('company_profiles')
      .select('id')
      .eq('id', data.companyId)
      .eq('user_id', userId)
      .single();
    if (profileError || !company) {
      throw new Error('You do not have permission to add recipients for this company.');
    }

    const { data: existing } = await this.supabase
      .from('company_notification_recipients')
      .select('*, preference:company_notification_preferences!inner(company_id)')
      .eq('email', data.email)
      .eq('preference.company_id', data.companyId);
    if (existing && existing.length > 0) {
      throw new Error('This email address is already receiving notifications for this company.');
    }

    let preferences: { id: string }[] = [];
    if (data.preferenceId) {
      const { data: pref, error } = await this.supabase
        .from('company_notification_preferences')
        .select('id')
        .eq('id', data.preferenceId)
        .eq('company_id', data.companyId)
        .single();
      if (error || !pref) {
        throw new Error('The specified notification preference does not exist or belongs to a different company.');
      }
      preferences = [pref];
    } else {
      const { data: allPrefs, error } = await this.supabase
        .from('company_notification_preferences')
        .select('id')
        .eq('company_id', data.companyId);
      if (error || !allPrefs || allPrefs.length === 0) {
        const types: NotificationType[] = [
          'new_member_domain',
          'domain_verified',
          'domain_verification_failed',
          'security_alert',
        ];
        const defaults = types.map(t => ({
          company_id: data.companyId,
          notification_type: t,
          enabled: t === 'security_alert',
          channel: 'both' as NotificationChannel,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
        const { data: created, error: createError } = await this.supabase
          .from('company_notification_preferences')
          .insert(defaults)
          .select('id');
        if (createError || !created) {
          throw new Error('Failed to create notification preferences.');
        }
        preferences = created as { id: string }[];
      } else {
        preferences = allPrefs as { id: string }[];
      }
    }

    const recipients = preferences.map(pref => ({
      preference_id: pref.id,
      email: data.email,
      is_admin: data.isAdmin,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { data: added, error: addError } = await this.supabase
      .from('company_notification_recipients')
      .insert(recipients)
      .select();

    if (addError || !added) {
      throw new Error('Failed to add recipient.');
    }

    return { recipients: added as CompanyNotificationRecipient[] };
  }

  async removeRecipient(userId: string, recipientId: string): Promise<void> {
    const { data: recipient, error } = await this.supabase
      .from('company_notification_recipients')
      .select(`*, preference:company_notification_preferences!inner(*, company:company_profiles!inner(id, user_id))`)
      .eq('id', recipientId)
      .single();
    if (error || !recipient) {
      throw new Error('Notification recipient not found.');
    }
    if (recipient.preference.company.user_id !== userId) {
      throw new Error('You do not have permission to remove this recipient.');
    }

    if (
      recipient.is_admin &&
      recipient.preference.notification_type === 'security_alert'
    ) {
      const { count, error: countError } = await this.supabase
        .from('company_notification_recipients')
        .select('id', { count: 'exact' })
        .eq('preference_id', recipient.preference_id)
        .eq('is_admin', true);
      if (countError) {
        throw new Error('Failed to verify if this is the last admin recipient.');
      }
      if (count === 1) {
        throw new Error('Cannot remove the last admin recipient for security alerts. Add another admin recipient first.');
      }
    }

    const { error: deleteError } = await this.supabase
      .from('company_notification_recipients')
      .delete()
      .eq('id', recipientId);
    if (deleteError) {
      throw new Error('Failed to delete recipient.');
    }
  }
}
