-- Enable required extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Create enum types for validation statuses
CREATE TYPE validation_status AS ENUM ('pending', 'in_progress', 'verified', 'rejected');
CREATE TYPE document_type AS ENUM ('registration', 'tax', 'identity', 'other');

-- Create or modify company_profiles table
CREATE TABLE IF NOT EXISTS company_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    legal_name TEXT,
    registration_number TEXT,
    vat_id TEXT,
    industry TEXT,
    size TEXT CHECK (size IN ('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+')),
    website TEXT,
    status validation_status DEFAULT 'pending',
    is_verified BOOLEAN DEFAULT false,
    verification_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Create company_addresses table
CREATE TABLE IF NOT EXISTS company_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'primary',
    street TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT,
    postal_code TEXT,
    country TEXT NOT NULL,
    is_validated BOOLEAN DEFAULT false,
    validation_source TEXT,
    validation_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, type)
);

-- Create company_domains table
CREATE TABLE IF NOT EXISTS company_domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
    domain TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    verification_token TEXT,
    is_verified BOOLEAN DEFAULT false,
    verification_method TEXT,
    verification_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, domain)
);

-- Create company_documents table
CREATE TABLE IF NOT EXISTS company_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
    type document_type NOT NULL,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    verification_date TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create company_verification_logs table
CREATE TABLE IF NOT EXISTS company_verification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
    verification_type TEXT NOT NULL,
    status validation_status NOT NULL,
    notes TEXT,
    verified_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_company_profiles_user_id ON company_profiles(user_id);
CREATE INDEX idx_company_addresses_company_id ON company_addresses(company_id);
CREATE INDEX idx_company_domains_company_id ON company_domains(company_id);
CREATE INDEX idx_company_documents_company_id ON company_documents(company_id);
CREATE INDEX idx_company_verification_logs_company_id ON company_verification_logs(company_id);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to all tables
CREATE TRIGGER update_company_profiles_updated_at
    BEFORE UPDATE ON company_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_addresses_updated_at
    BEFORE UPDATE ON company_addresses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_domains_updated_at
    BEFORE UPDATE ON company_domains
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_documents_updated_at
    BEFORE UPDATE ON company_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_verification_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for company_profiles
CREATE POLICY "Users can view their own company profile"
    ON company_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own company profile"
    ON company_profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- Create policies for company_addresses
CREATE POLICY "Users can view their company addresses"
    ON company_addresses FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM company_profiles
        WHERE company_profiles.id = company_addresses.company_id
        AND company_profiles.user_id = auth.uid()
    ));

CREATE POLICY "Users can update their company addresses"
    ON company_addresses FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM company_profiles
        WHERE company_profiles.id = company_addresses.company_id
        AND company_profiles.user_id = auth.uid()
    ));

-- Similar policies for other tables
-- ... (Add similar policies for domains, documents, and verification logs) 