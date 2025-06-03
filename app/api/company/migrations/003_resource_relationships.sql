CREATE TABLE resource_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_type VARCHAR(50) NOT NULL,
  parent_id UUID NOT NULL, 
  child_type VARCHAR(50) NOT NULL,
  child_id UUID NOT NULL,
  relationship_type VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(parent_type, parent_id, child_type, child_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_resource_relationships_parent ON resource_relationships(parent_type, parent_id);
CREATE INDEX idx_resource_relationships_child ON resource_relationships(child_type, child_id);

-- Add updated_at trigger
CREATE TRIGGER update_resource_relationships_updated_at
    BEFORE UPDATE ON resource_relationships
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
