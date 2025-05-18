-- Create company notification preferences table
CREATE TABLE IF NOT EXISTS company_notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL,
    enabled BOOLEAN DEFAULT true,
    channel TEXT NOT NULL DEFAULT 'both', -- 'email', 'in_app', or 'both'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, notification_type)
);

-- Create company notification recipients table
CREATE TABLE IF NOT EXISTS company_notification_recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    preference_id UUID NOT NULL REFERENCES company_notification_preferences(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email TEXT, -- Can be null if user_id is provided
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CHECK (user_id IS NOT NULL OR email IS NOT NULL) -- At least one must be provided
);

-- Create notifications table to store sent notifications
CREATE TABLE IF NOT EXISTS company_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL,
    recipient_id UUID REFERENCES company_notification_recipients(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    channel TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed'
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMPTZ
);

-- Add indexes for better query performance
CREATE INDEX idx_notification_prefs_company_id ON company_notification_preferences(company_id);
CREATE INDEX idx_notification_recipients_preference_id ON company_notification_recipients(preference_id);
CREATE INDEX idx_notifications_company_id ON company_notifications(company_id);
CREATE INDEX idx_notifications_recipient_id ON company_notifications(recipient_id);

-- Add triggers for updated_at
CREATE TRIGGER update_company_notification_preferences_updated_at
    BEFORE UPDATE ON company_notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_notification_recipients_updated_at
    BEFORE UPDATE ON company_notification_recipients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_notifications_updated_at
    BEFORE UPDATE ON company_notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE company_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_notification_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for company_notification_preferences
CREATE POLICY "Users can view their company notification preferences"
    ON company_notification_preferences FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM company_profiles
        WHERE company_profiles.id = company_notification_preferences.company_id
        AND company_profiles.user_id = auth.uid()
    ));

CREATE POLICY "Users can update their company notification preferences"
    ON company_notification_preferences FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM company_profiles
        WHERE company_profiles.id = company_notification_preferences.company_id
        AND company_profiles.user_id = auth.uid()
    ));

-- Create policies for company_notification_recipients
CREATE POLICY "Users can view their company notification recipients"
    ON company_notification_recipients FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM company_notification_preferences
        JOIN company_profiles ON company_profiles.id = company_notification_preferences.company_id
        WHERE company_notification_preferences.id = company_notification_recipients.preference_id
        AND company_profiles.user_id = auth.uid()
    ));

-- Create policies for company_notifications
CREATE POLICY "Users can view their company notifications"
    ON company_notifications FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM company_profiles
        WHERE company_profiles.id = company_notifications.company_id
        AND company_profiles.user_id = auth.uid()
    )); 