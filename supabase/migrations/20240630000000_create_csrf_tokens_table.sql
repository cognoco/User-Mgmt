-- Create CSRF tokens table for security token management
CREATE TABLE IF NOT EXISTS csrf_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_csrf_tokens_token ON csrf_tokens(token);
CREATE INDEX IF NOT EXISTS idx_csrf_tokens_expires_at ON csrf_tokens(expires_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE csrf_tokens ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows service role to manage all tokens
CREATE POLICY "Service role can manage CSRF tokens" ON csrf_tokens
FOR ALL USING (auth.role() = 'service_role');

-- Add a trigger to automatically update the updated_at field
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_csrf_tokens_updated_at 
    BEFORE UPDATE ON csrf_tokens 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 