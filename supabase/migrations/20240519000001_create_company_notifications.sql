-- Migration: Create company notification tables for preferences and logs

-- Create notification types enum
CREATE TYPE notification_type AS ENUM (
    'new_member_domain',
    'domain_verified',
    'domain_verification_failed',
    'security_alert'
);

-- Create notification channel enum
CREATE TYPE notification_channel AS ENUM (
    'email',
    'in_app',
    'both'
);

-- Create company_notification_preferences table
CREATE TABLE IF NOT EXISTS company_notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
    notification_type notification_type NOT NULL,
    enabled BOOLEAN DEFAULT true,
    channel notification_channel DEFAULT 'both',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    UNIQUE(company_id, notification_type)
);

-- Create company_notification_recipients table
CREATE TABLE IF NOT EXISTS company_notification_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    preference_id UUID NOT NULL REFERENCES company_notification_preferences(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    CHECK (user_id IS NOT NULL OR email IS NOT NULL)
);

-- Create company_notification_logs table
CREATE TABLE IF NOT EXISTS company_notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    preference_id UUID REFERENCES company_notification_preferences(id) ON DELETE SET NULL,
    recipient_id UUID REFERENCES company_notification_recipients(id) ON DELETE SET NULL,
    notification_type notification_type NOT NULL,
    channel notification_channel NOT NULL,
    content JSONB NOT NULL,
    status TEXT NOT NULL, -- 'pending', 'sent', 'failed', 'delivered'
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_company_notification_preferences_company_id 
    ON company_notification_preferences(company_id);
CREATE INDEX IF NOT EXISTS idx_company_notification_preferences_type 
    ON company_notification_preferences(notification_type);
CREATE INDEX IF NOT EXISTS idx_company_notification_recipients_preference_id 
    ON company_notification_recipients(preference_id);
CREATE INDEX IF NOT EXISTS idx_company_notification_recipients_user_id 
    ON company_notification_recipients(user_id);
CREATE INDEX IF NOT EXISTS idx_company_notification_logs_preference_id 
    ON company_notification_logs(preference_id);
CREATE INDEX IF NOT EXISTS idx_company_notification_logs_recipient_id 
    ON company_notification_logs(recipient_id);
CREATE INDEX IF NOT EXISTS idx_company_notification_logs_created_at 
    ON company_notification_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_company_notification_logs_status 
    ON company_notification_logs(status);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_notification_tables_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_company_notification_preferences_updated_at
    BEFORE UPDATE ON company_notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_tables_updated_at();

CREATE TRIGGER update_company_notification_recipients_updated_at
    BEFORE UPDATE ON company_notification_recipients
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_tables_updated_at();

CREATE TRIGGER update_company_notification_logs_updated_at
    BEFORE UPDATE ON company_notification_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_tables_updated_at();

-- Enable row level security for notification tables
ALTER TABLE company_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_notification_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_notification_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for company_notification_preferences
CREATE POLICY "Users can view their company notification preferences" 
    ON company_notification_preferences FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM company_profiles
        WHERE company_profiles.id = company_notification_preferences.company_id
        AND company_profiles.user_id = auth.uid()
    ));

CREATE POLICY "Admin users can update their company notification preferences" 
    ON company_notification_preferences FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM company_profiles
        WHERE company_profiles.id = company_notification_preferences.company_id
        AND company_profiles.user_id = auth.uid()
    ));

CREATE POLICY "Admin users can insert company notification preferences" 
    ON company_notification_preferences FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM company_profiles
        WHERE company_profiles.id = company_notification_preferences.company_id
        AND company_profiles.user_id = auth.uid()
    ));

-- Create policies for company_notification_recipients
CREATE POLICY "Users can view company notification recipients" 
    ON company_notification_recipients FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM company_notification_preferences
        JOIN company_profiles ON company_profiles.id = company_notification_preferences.company_id
        WHERE company_notification_preferences.id = company_notification_recipients.preference_id
        AND company_profiles.user_id = auth.uid()
    ));

CREATE POLICY "Admin users can manage company notification recipients" 
    ON company_notification_recipients FOR ALL
    USING (EXISTS (
        SELECT 1 FROM company_notification_preferences
        JOIN company_profiles ON company_profiles.id = company_notification_preferences.company_id
        WHERE company_notification_preferences.id = company_notification_recipients.preference_id
        AND company_profiles.user_id = auth.uid()
    ));

-- Create policies for company_notification_logs
CREATE POLICY "Users can view notification logs for their company" 
    ON company_notification_logs FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM company_notification_preferences
        JOIN company_profiles ON company_profiles.id = company_notification_preferences.company_id
        WHERE company_notification_preferences.id = company_notification_logs.preference_id
        AND company_profiles.user_id = auth.uid()
    ) OR EXISTS (
        SELECT 1 FROM company_notification_recipients
        WHERE company_notification_recipients.id = company_notification_logs.recipient_id
        AND company_notification_recipients.user_id = auth.uid()
    ));

-- Insert default notification preferences for existing companies
-- Note: Only add preference for new_member_domain for now
INSERT INTO company_notification_preferences (
    company_id,
    notification_type,
    enabled,
    channel
)
SELECT 
    id AS company_id,
    'new_member_domain'::notification_type,
    TRUE AS enabled,
    'both'::notification_channel
FROM company_profiles
WHERE domain_verified = TRUE;

-- Add company admins as default recipients
INSERT INTO company_notification_recipients (
    preference_id,
    user_id,
    is_admin
)
SELECT 
    pref.id AS preference_id,
    cp.user_id,
    TRUE AS is_admin
FROM company_notification_preferences pref
JOIN company_profiles cp ON cp.id = pref.company_id
WHERE cp.user_id IS NOT NULL; 