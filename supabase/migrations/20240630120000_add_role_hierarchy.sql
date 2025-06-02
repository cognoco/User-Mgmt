-- Migration: Add parent role hierarchy to roles table

ALTER TABLE public.roles
    ADD COLUMN IF NOT EXISTS parent_role_id UUID REFERENCES public.roles(id);

-- Prevent self referencing
ALTER TABLE public.roles
    ADD CONSTRAINT roles_parent_not_self CHECK (parent_role_id IS NULL OR parent_role_id <> id);

-- Index for fast traversal
CREATE INDEX IF NOT EXISTS idx_roles_parent_role_id ON public.roles(parent_role_id);

-- Trigger function to prevent circular references
CREATE OR REPLACE FUNCTION public.check_role_hierarchy()
RETURNS TRIGGER AS $$
DECLARE
    current_id UUID;
BEGIN
    IF NEW.parent_role_id IS NULL THEN
        RETURN NEW;
    END IF;
    current_id := NEW.parent_role_id;
    WHILE current_id IS NOT NULL LOOP
        IF current_id = NEW.id THEN
            RAISE EXCEPTION 'Circular role hierarchy detected';
        END IF;
        SELECT parent_role_id INTO current_id FROM public.roles WHERE id = current_id;
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS roles_check_hierarchy ON public.roles;
CREATE TRIGGER roles_check_hierarchy
BEFORE INSERT OR UPDATE ON public.roles
FOR EACH ROW EXECUTE FUNCTION public.check_role_hierarchy();
