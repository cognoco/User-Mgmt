-- Migration: Add additional indexes for optimized queries

-- User listing & filtering indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_first_name ON profiles(first_name);
CREATE INDEX IF NOT EXISTS idx_profiles_last_name ON profiles(last_name);

-- Team member management indexes
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON team_members(role);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_user_action_logs_user_id ON user_actions_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_action_logs_created_at ON user_actions_log(created_at);
CREATE INDEX IF NOT EXISTS idx_user_action_logs_action ON user_actions_log(action);
CREATE INDEX IF NOT EXISTS idx_user_action_logs_target_resource_type ON user_actions_log(target_resource_type);
CREATE INDEX IF NOT EXISTS idx_user_action_logs_status ON user_actions_log(status);

-- Company domain indexes
CREATE INDEX IF NOT EXISTS idx_company_domains_domain ON company_domains(domain);
CREATE INDEX IF NOT EXISTS idx_company_domains_company_id ON company_domains(company_id);
CREATE INDEX IF NOT EXISTS idx_company_domains_is_verified ON company_domains(is_verified);

-- Document management indexes
CREATE INDEX IF NOT EXISTS idx_company_documents_company_id ON company_documents(company_id);
CREATE INDEX IF NOT EXISTS idx_company_documents_type ON company_documents(type);
CREATE INDEX IF NOT EXISTS idx_company_documents_created_at ON company_documents(created_at);
CREATE INDEX IF NOT EXISTS idx_company_documents_status ON company_documents(status);
