import { SupabaseClient } from '@supabase/supabase-js';

export const up = async (client: SupabaseClient) => {
  await client.rpc('exec', {
    query: `
    -- Retention records table for tracking user retention status
    CREATE TABLE IF NOT EXISTS retention_records (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      retention_type VARCHAR(20) NOT NULL DEFAULT 'personal',
      last_login_at TIMESTAMPTZ,
      last_activity_at TIMESTAMPTZ,
      become_inactive_at TIMESTAMPTZ,
      anonymize_at TIMESTAMPTZ,
      notified_at JSONB DEFAULT '{}'::jsonb,
      exemption_reason TEXT,
      exempted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      exempted_until TIMESTAMPTZ,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- Create indexes for efficient queries
    CREATE INDEX IF NOT EXISTS idx_retention_records_user_id ON retention_records(user_id);
    CREATE INDEX IF NOT EXISTS idx_retention_records_status ON retention_records(status);
    CREATE INDEX IF NOT EXISTS idx_retention_records_type ON retention_records(retention_type);
    CREATE INDEX IF NOT EXISTS idx_retention_records_become_inactive ON retention_records(become_inactive_at);
    CREATE INDEX IF NOT EXISTS idx_retention_records_anonymize ON retention_records(anonymize_at);

    -- Retention metrics table for tracking aggregate statistics
    CREATE TABLE IF NOT EXISTS retention_metrics (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      date DATE NOT NULL,
      active_users INTEGER NOT NULL DEFAULT 0,
      warning_users INTEGER NOT NULL DEFAULT 0,
      inactive_users INTEGER NOT NULL DEFAULT 0,
      grace_period_users INTEGER NOT NULL DEFAULT 0,
      anonymizing_users INTEGER NOT NULL DEFAULT 0,
      anonymized_users INTEGER NOT NULL DEFAULT 0,
      personal_users INTEGER NOT NULL DEFAULT 0,
      business_users INTEGER NOT NULL DEFAULT 0,
      execution_time_ms INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- Create index for date
    CREATE UNIQUE INDEX IF NOT EXISTS idx_retention_metrics_date ON retention_metrics(date);

    -- Retention notification history table
    CREATE TABLE IF NOT EXISTS retention_notifications (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      type VARCHAR(30) NOT NULL,
      sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      delivery_status VARCHAR(20) NOT NULL DEFAULT 'pending',
      read_at TIMESTAMPTZ,
      response_action VARCHAR(30),
      response_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- Create indexes for notification queries
    CREATE INDEX IF NOT EXISTS idx_retention_notif_user_id ON retention_notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_retention_notif_type ON retention_notifications(type);
    CREATE INDEX IF NOT EXISTS idx_retention_notif_sent ON retention_notifications(sent_at);

    -- Create trigger to update the updated_at timestamp
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Apply the trigger to the tables
    CREATE TRIGGER set_updated_at_retention_records
    BEFORE UPDATE ON retention_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER set_updated_at_retention_metrics
    BEFORE UPDATE ON retention_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER set_updated_at_retention_notifications
    BEFORE UPDATE ON retention_notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

    -- Create stored procedure for anonymizing user data
    CREATE OR REPLACE FUNCTION anonymize_user_data(user_uuid UUID)
    RETURNS VOID AS $$
    DECLARE
      random_email TEXT;
      random_string TEXT;
    BEGIN
      -- Generate random values for anonymization
      random_email := 'anon_' || substr(md5(random()::text), 1, 10) || '@anonymized.invalid';
      random_string := 'Anonymized_' || substr(md5(random()::text), 1, 8);
      
      -- Update users table with anonymized data
      UPDATE auth.users
      SET email = random_email,
          phone = NULL,
          email_confirmed_at = NULL,
          phone_confirmed_at = NULL,
          last_sign_in_at = NULL
      WHERE id = user_uuid;
      
      -- Update other user profile information
      UPDATE public.profiles
      SET bio = NULL,
          location = NULL,
          website = NULL,
          phone_number = NULL,
          company_name = NULL,
          company_website = NULL,
          position = NULL,
          department = NULL,
          vat_id = NULL,
          address = NULL
      WHERE user_id = user_uuid;
      
      -- Update user privacy settings to maximum privacy
      UPDATE public.profiles
      SET privacy_settings = jsonb_build_object(
        'showEmail', false,
        'showPhone', false,
        'showLocation', false,
        'profileVisibility', 'private'
      )
      WHERE user_id = user_uuid;
      
      -- Update retention record status
      UPDATE retention_records
      SET status = 'anonymized',
          updated_at = NOW()
      WHERE user_id = user_uuid;
    END;
    $$ LANGUAGE plpgsql;
    `
  });
};

export const down = async (client: SupabaseClient) => {
  await client.rpc('exec', {
    query: `
    -- Drop tables and functions
    DROP TABLE IF EXISTS retention_notifications;
    DROP TABLE IF EXISTS retention_metrics;
    DROP TABLE IF EXISTS retention_records;
    DROP FUNCTION IF EXISTS anonymize_user_data;
    `
  });
}; 