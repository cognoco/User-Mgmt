import { SupabaseClient } from '@supabase/supabase-js';
import compliance from '../../../../config/compliance.config';

export const up = async (client: SupabaseClient) => {
  await client.rpc('exec', {
    query: `
    CREATE TABLE IF NOT EXISTS audit_logs (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      method TEXT,
      path TEXT,
      user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      ip_address TEXT,
      user_agent TEXT,
      status_code INTEGER,
      response_time INTEGER,
      query_params JSONB,
      request_body JSONB,
      headers JSONB,
      error TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- Add indexes for common queries
    CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_status_code ON audit_logs(status_code);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_path ON audit_logs(path);

    -- Add retention policy (90 days by default, can be adjusted)
    CREATE OR REPLACE FUNCTION delete_old_audit_logs()
    RETURNS void
    LANGUAGE plpgsql
    AS $$
    BEGIN
      DELETE FROM audit_logs
      WHERE timestamp < NOW() - INTERVAL '${compliance.auditLogRetentionDays} days';
    END;
    $$;

    -- Create a scheduled job to run daily
    SELECT cron.schedule(
      'delete-old-audit-logs',
      '0 0 * * *',  -- Run at midnight every day
      'SELECT delete_old_audit_logs();'
    );
    `
  });
};

export const down = async (client: SupabaseClient) => {
  await client.rpc('exec', {
    query: `
    -- Remove the scheduled job
    SELECT cron.unschedule('delete-old-audit-logs');

    -- Drop the function
    DROP FUNCTION IF EXISTS delete_old_audit_logs();

    -- Drop the table and its indexes
    DROP TABLE IF EXISTS audit_logs;
    `
  });
}; 