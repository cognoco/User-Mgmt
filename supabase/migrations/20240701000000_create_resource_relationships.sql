-- Create table for resource parent-child relationships
CREATE TABLE resource_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_type VARCHAR(50) NOT NULL,
  parent_id UUID NOT NULL,
  child_type VARCHAR(50) NOT NULL,
  child_id UUID NOT NULL,
  relationship_type VARCHAR(20) NOT NULL,
  UNIQUE(parent_type, parent_id, child_type, child_id)
);
