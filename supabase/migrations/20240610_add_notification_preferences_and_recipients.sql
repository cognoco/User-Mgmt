-- Notification Preferences Table
CREATE TABLE IF NOT EXISTS company_notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL, -- e.g., 'sso_event', 'security_alert', etc.
    enabled BOOLEAN DEFAULT true,
    channel TEXT NOT NULL DEFAULT 'both', -- 'email', 'in_app', or 'both'
    require_email_for_critical BOOLEAN DEFAULT false, -- If true, cannot opt out of email for critical events
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    UNIQUE(company_id, notification_type)
);

-- Notification Recipients Table
CREATE TABLE IF NOT EXISTS company_notification_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    preference_id UUID NOT NULL REFERENCES company_notification_preferences(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    group_name TEXT, -- e.g., 'security_admins', 'it_admins', or NULL for individual
    is_primary_contact BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    CHECK (user_id IS NOT NULL OR group_name IS NOT NULL)
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_company_notification_preferences_company_id 
    ON company_notification_preferences(company_id);
CREATE INDEX IF NOT EXISTS idx_company_notification_preferences_type 
    ON company_notification_preferences(notification_type);
CREATE INDEX IF NOT EXISTS idx_company_notification_recipients_preference_id 
    ON company_notification_recipients(preference_id);
CREATE INDEX IF NOT EXISTS idx_company_notification_recipients_user_id 
    ON company_notification_recipients(user_id);
CREATE INDEX IF NOT EXISTS idx_company_notification_recipients_group_name 
    ON company_notification_recipients(group_name);
CREATE INDEX IF NOT EXISTS idx_company_notification_recipients_primary_contact 
    ON company_notification_recipients(is_primary_contact);

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

-- Enable RLS (add policies as needed)
ALTER TABLE company_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_notification_recipients ENABLE ROW LEVEL SECURITY; 