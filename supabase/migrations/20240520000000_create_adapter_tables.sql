-- Migration file for User Management Module adapter tables
-- This creates all the necessary tables for the database adapter layer

-- Profiles table to store user profile information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  display_name TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  account_type TEXT DEFAULT 'personal',
  account_data JSONB,
  deactivation_reason TEXT,
  deactivated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light',
  language TEXT DEFAULT 'en',
  notifications JSONB DEFAULT '{"email": true, "push": true, "inApp": true}'::jsonb,
  timezone TEXT DEFAULT 'UTC',
  date_format TEXT DEFAULT 'MM/DD/YYYY',
  time_format TEXT DEFAULT '12h',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Profile visibility settings
CREATE TABLE IF NOT EXISTS public.profile_visibility (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_visible BOOLEAN DEFAULT FALSE,
  name_visible BOOLEAN DEFAULT TRUE,
  bio_visible BOOLEAN DEFAULT TRUE,
  location_visible BOOLEAN DEFAULT TRUE,
  website_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Teams table
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT FALSE,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team members table
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  UNIQUE(team_id, user_id)
);

-- Team invitations table
CREATE TABLE IF NOT EXISTS public.team_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  declined_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, email)
);

-- Roles table
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  is_system_role BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name)
);

-- User roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);

-- Permissions definition table
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  resource TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, resource)
);

-- Role permissions table
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_name TEXT NOT NULL,
  resource TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role_id, permission_name, resource),
  FOREIGN KEY (permission_name, resource) REFERENCES public.permissions(name, resource) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_team_id ON public.team_invitations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON public.team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON public.role_permissions(role_id);

-- Set up Row Level Security (RLS) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_visibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can view their own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Profile visibility policies
CREATE POLICY "Users can view their own visibility settings"
  ON public.profile_visibility FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own visibility settings"
  ON public.profile_visibility FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own visibility settings"
  ON public.profile_visibility FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Teams policies
CREATE POLICY "Team members can view teams"
  ON public.teams FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.team_members WHERE team_id = id
    )
    OR is_public = TRUE
  );

CREATE POLICY "Team owners can update teams"
  ON public.teams FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Team owners can delete teams"
  ON public.teams FOR DELETE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create teams"
  ON public.teams FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Team members policies
CREATE POLICY "Team members can view team members"
  ON public.team_members FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.team_members WHERE team_id = team_id
    )
  );

CREATE POLICY "Team owners can manage team members"
  ON public.team_members FOR ALL
  USING (
    auth.uid() IN (
      SELECT owner_id FROM public.teams WHERE id = team_id
    )
  );

-- Team invitations policies
CREATE POLICY "Team members can view team invitations"
  ON public.team_invitations FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.team_members WHERE team_id = team_id
    )
  );

CREATE POLICY "Users can view invitations sent to their email"
  ON public.team_invitations FOR SELECT
  USING (
    email IN (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Team owners can manage invitations"
  ON public.team_invitations FOR ALL
  USING (
    auth.uid() IN (
      SELECT owner_id FROM public.teams WHERE id = team_id
    )
  );

-- Create functions for profile management
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.id, NEW.email, NOW(), NOW());
  
  INSERT INTO public.user_preferences (user_id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW());
  
  INSERT INTO public.profile_visibility (user_id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default roles
INSERT INTO public.roles (name, description, is_system_role, created_at, updated_at)
VALUES 
  ('admin', 'Administrator with full system access', TRUE, NOW(), NOW()),
  ('user', 'Regular user with standard permissions', TRUE, NOW(), NOW()),
  ('guest', 'Guest user with limited access', TRUE, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions
INSERT INTO public.permissions (name, resource, description, created_at)
VALUES 
  ('create', 'user', 'Create users', NOW()),
  ('read', 'user', 'Read user data', NOW()),
  ('update', 'user', 'Update user data', NOW()),
  ('delete', 'user', 'Delete users', NOW()),
  ('create', 'team', 'Create teams', NOW()),
  ('read', 'team', 'Read team data', NOW()),
  ('update', 'team', 'Update team data', NOW()),
  ('delete', 'team', 'Delete teams', NOW()),
  ('invite', 'team', 'Invite users to teams', NOW()),
  ('create', 'role', 'Create roles', NOW()),
  ('read', 'role', 'Read role data', NOW()),
  ('update', 'role', 'Update roles', NOW()),
  ('delete', 'role', 'Delete roles', NOW()),
  ('assign', 'role', 'Assign roles to users', NOW())
ON CONFLICT (name, resource) DO NOTHING;

-- Assign default permissions to roles
DO $$
DECLARE
  admin_role_id UUID;
  user_role_id UUID;
  guest_role_id UUID;
BEGIN
  SELECT id INTO admin_role_id FROM public.roles WHERE name = 'admin';
  SELECT id INTO user_role_id FROM public.roles WHERE name = 'user';
  SELECT id INTO guest_role_id FROM public.roles WHERE name = 'guest';
  
  -- Admin permissions (all)
  INSERT INTO public.role_permissions (role_id, permission_name, resource, created_at)
  SELECT admin_role_id, name, resource, NOW()
  FROM public.permissions
  ON CONFLICT (role_id, permission_name, resource) DO NOTHING;
  
  -- User permissions
  INSERT INTO public.role_permissions (role_id, permission_name, resource, created_at)
  VALUES
    (user_role_id, 'read', 'user', NOW()),
    (user_role_id, 'update', 'user', NOW()),
    (user_role_id, 'create', 'team', NOW()),
    (user_role_id, 'read', 'team', NOW()),
    (user_role_id, 'update', 'team', NOW()),
    (user_role_id, 'delete', 'team', NOW()),
    (user_role_id, 'invite', 'team', NOW()),
    (user_role_id, 'read', 'role', NOW())
  ON CONFLICT (role_id, permission_name, resource) DO NOTHING;
  
  -- Guest permissions
  INSERT INTO public.role_permissions (role_id, permission_name, resource, created_at)
  VALUES
    (guest_role_id, 'read', 'user', NOW()),
    (guest_role_id, 'read', 'team', NOW())
  ON CONFLICT (role_id, permission_name, resource) DO NOTHING;
END $$;
