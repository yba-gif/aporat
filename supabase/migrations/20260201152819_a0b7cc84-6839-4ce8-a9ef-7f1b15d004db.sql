-- Add cross-module linking columns to vault_documents
ALTER TABLE vault_documents ADD COLUMN IF NOT EXISTS case_id text;
ALTER TABLE vault_documents ADD COLUMN IF NOT EXISTS entity_id text;

-- Add cross-module linking columns to demo_fraud_nodes
ALTER TABLE demo_fraud_nodes ADD COLUMN IF NOT EXISTS case_id text;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_vault_documents_case_id ON vault_documents(case_id);
CREATE INDEX IF NOT EXISTS idx_vault_documents_entity_id ON vault_documents(entity_id);
CREATE INDEX IF NOT EXISTS idx_demo_fraud_nodes_case_id ON demo_fraud_nodes(case_id);