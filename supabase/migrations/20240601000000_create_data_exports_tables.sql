-- Migration: Create data exports tables for tracking and managing export operations

-- Create export format enum
CREATE TYPE export_format AS ENUM (
    'json',
    'csv'
);

-- Create export status enum
CREATE TYPE export_status AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed'
);

-- Create user data exports table
CREATE TABLE IF NOT EXISTS user_data_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    format export_format NOT NULL DEFAULT 'json',
    status export_status NOT NULL DEFAULT 'pending',
    file_path TEXT,
    download_token UUID DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
    error_message TEXT,
    file_size_bytes INTEGER,
    is_large_dataset BOOLEAN DEFAULT FALSE,
    notification_sent BOOLEAN DEFAULT FALSE
);

-- Create company data exports table
CREATE TABLE IF NOT EXISTS company_data_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    format export_format NOT NULL DEFAULT 'json',
    status export_status NOT NULL DEFAULT 'pending',
    file_path TEXT,
    download_token UUID DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
    error_message TEXT,
    file_size_bytes INTEGER,
    is_large_dataset BOOLEAN DEFAULT FALSE,
    notification_sent BOOLEAN DEFAULT FALSE
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_exports_user_id ON user_data_exports(user_id);
CREATE INDEX IF NOT EXISTS idx_user_exports_status ON user_data_exports(status);
CREATE INDEX IF NOT EXISTS idx_user_exports_token ON user_data_exports(download_token);

CREATE INDEX IF NOT EXISTS idx_company_exports_company_id ON company_data_exports(company_id);
CREATE INDEX IF NOT EXISTS idx_company_exports_user_id ON company_data_exports(user_id);
CREATE INDEX IF NOT EXISTS idx_company_exports_status ON company_data_exports(status);
CREATE INDEX IF NOT EXISTS idx_company_exports_token ON company_data_exports(download_token);

-- Create function to clean up expired exports (runs daily via cron)
CREATE OR REPLACE FUNCTION delete_expired_exports()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Delete expired files (older than expiry time)
    DELETE FROM user_data_exports WHERE expires_at < NOW();
    DELETE FROM company_data_exports WHERE expires_at < NOW();
END;
$$;

-- Schedule job to run daily at midnight to clean up expired exports
SELECT cron.schedule(
  'delete-expired-exports',
  '0 0 * * *',  -- Run at midnight every day
  'SELECT delete_expired_exports();'
);

-- Create storage buckets for exports if they don't exist
-- Note: This should be reflected in storage.buckets config too 