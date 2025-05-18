-- Migration: Create company_domains table and migrate existing data
-- This migration adds support for multiple domains per company

-- Create company_domains table
CREATE TABLE IF NOT EXISTS company_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
    domain TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    verification_token TEXT,
    is_verified BOOLEAN DEFAULT false,
    verification_method TEXT DEFAULT 'dns_txt',
    verification_date TIMESTAMPTZ,
    last_checked TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    UNIQUE(company_id, domain)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_company_domains_company_id ON company_domains(company_id);
CREATE INDEX IF NOT EXISTS idx_company_domains_domain ON company_domains(domain);
CREATE INDEX IF NOT EXISTS idx_company_domains_is_verified ON company_domains(is_verified);

-- Migrate existing domain data from company_profiles
INSERT INTO company_domains (
    company_id,
    domain,
    is_primary,
    verification_token,
    is_verified,
    verification_method,
    verification_date,
    last_checked,
    created_at,
    updated_at
)
SELECT 
    id AS company_id,
    domain_name AS domain,
    TRUE AS is_primary,
    domain_verification_token AS verification_token,
    COALESCE(domain_verified, FALSE) AS is_verified,
    'dns_txt' AS verification_method,
    CASE WHEN domain_verified = TRUE THEN domain_last_checked ELSE NULL END AS verification_date,
    domain_last_checked AS last_checked,
    created_at,
    updated_at
FROM company_profiles
WHERE domain_name IS NOT NULL AND domain_name != '';

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_company_domains_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_company_domains_updated_at
    BEFORE UPDATE ON company_domains
    FOR EACH ROW
    EXECUTE FUNCTION update_company_domains_updated_at();

-- Enable row level security for company_domains
ALTER TABLE company_domains ENABLE ROW LEVEL SECURITY;

-- Create policies for company_domains
CREATE POLICY "Users can view their company domains" 
    ON company_domains FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM company_profiles
        WHERE company_profiles.id = company_domains.company_id
        AND company_profiles.user_id = auth.uid()
    ));

CREATE POLICY "Admin users can update their company domains" 
    ON company_domains FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM company_profiles
        WHERE company_profiles.id = company_domains.company_id
        AND company_profiles.user_id = auth.uid()
    ));

CREATE POLICY "Admin users can insert company domains" 
    ON company_domains FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM company_profiles
        WHERE company_profiles.id = company_domains.company_id
        AND company_profiles.user_id = auth.uid()
    ));

CREATE POLICY "Admin users can delete company domains" 
    ON company_domains FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM company_profiles
        WHERE company_profiles.id = company_domains.company_id
        AND company_profiles.user_id = auth.uid()
    ));

-- In a future migration, we may want to remove these columns from company_profiles
-- once all client code is updated to use the company_domains table
-- ALTER TABLE company_profiles DROP COLUMN domain_name;
-- ALTER TABLE company_profiles DROP COLUMN domain_verification_token;
-- ALTER TABLE company_profiles DROP COLUMN domain_verified;
-- ALTER TABLE company_profiles DROP COLUMN domain_last_checked; 