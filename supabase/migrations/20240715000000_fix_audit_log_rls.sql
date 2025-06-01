-- Fix RLS policies for user_actions_log table
-- This addresses the 401 unauthorized errors when trying to log user actions

-- Enable RLS on user_actions_log if not already enabled
ALTER TABLE user_actions_log ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own action logs
CREATE POLICY "Users can insert their own action logs"
  ON user_actions_log FOR INSERT
  WITH CHECK (
    -- Allow if user_id matches auth.uid() or if user_id is null (for system/unauthenticated actions)
    user_id = auth.uid()::text OR user_id IS NULL
  );

-- Allow users to view their own action logs
CREATE POLICY "Users can view their own action logs"
  ON user_actions_log FOR SELECT
  USING (
    user_id = auth.uid()::text
  );

-- Allow service role to manage all action logs (for admin purposes)
CREATE POLICY "Service role can manage all action logs"
  ON user_actions_log FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Allow system to log actions without authentication (for registration failures, etc.)
CREATE POLICY "Allow system action logging"
  ON user_actions_log FOR INSERT
  WITH CHECK (
    user_id IS NULL
  ); 