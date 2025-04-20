-- supabase/migrations/20240101000000_create_subscription_tables.sql 
-- Replace YYYYMMDDHHMMSS with the actual timestamp

CREATE TABLE subscription_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar NOT NULL,
    description text,
    price_id varchar, -- Stripe Price ID
    billing_period varchar CHECK (billing_period IN ('monthly', 'yearly')),
    amount decimal(10, 2),
    currency varchar(3),
    features jsonb,
    team_size int,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL, -- Assuming organizations exist or will be added
    plan_id uuid REFERENCES subscription_plans(id),
    status varchar CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')) NOT NULL,
    current_period_start timestamp with time zone,
    current_period_end timestamp with time zone,
    cancel_at_period_end boolean DEFAULT false,
    trial_end timestamp with time zone,
    stripe_subscription_id varchar UNIQUE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
    -- Add foreign key constraint for organization_id once organizations table is defined
    -- CONSTRAINT fk_organization FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE TABLE payment_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL, -- Assuming organizations exist or will be added
    subscription_id uuid REFERENCES subscriptions(id),
    amount decimal(10, 2),
    currency varchar(3),
    status varchar CHECK (status IN ('succeeded', 'failed', 'pending')) NOT NULL,
    stripe_payment_intent_id varchar UNIQUE,
    billing_reason varchar,
    invoice_url varchar,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
    -- Add foreign key constraint for organization_id once organizations table is defined
    -- CONSTRAINT fk_organization FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Indexes for performance
CREATE INDEX idx_subscriptions_org_id ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_payment_history_org_id ON payment_history(organization_id);
CREATE INDEX idx_payment_history_sub_id ON payment_history(subscription_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for subscription_plans
CREATE TRIGGER set_subscription_plans_timestamp
BEFORE UPDATE ON subscription_plans
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Triggers for subscriptions
CREATE TRIGGER set_subscriptions_timestamp
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Add missing constraints and indexes
ALTER TABLE subscriptions
    ADD CONSTRAINT check_trial_end CHECK (trial_end > created_at),
    ADD CONSTRAINT check_period_dates CHECK (current_period_end > current_period_start);

-- Add composite index for subscription lookup by status and date
CREATE INDEX idx_subscriptions_status_period ON subscriptions(status, current_period_end);

-- Add index for payment history lookup by date
CREATE INDEX idx_payment_history_created_at ON payment_history(created_at);

-- Add constraint to ensure valid currency codes
ALTER TABLE payment_history
    ADD CONSTRAINT check_currency_code CHECK (length(currency) = 3);

-- Add constraint for minimum amount
ALTER TABLE payment_history
    ADD CONSTRAINT check_amount CHECK (amount > 0);

-- Add constraint for valid price_id format in subscription_plans
ALTER TABLE subscription_plans
    ADD CONSTRAINT check_price_id CHECK (price_id ~ '^price_[a-zA-Z0-9_]+$');

-- Add constraint for minimum team size
ALTER TABLE subscription_plans
    ADD CONSTRAINT check_team_size CHECK (team_size > 0);

-- Add trigger for payment_history timestamps
CREATE TRIGGER set_payment_history_timestamp
    BEFORE UPDATE ON payment_history
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp(); 