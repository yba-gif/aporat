-- Step 1: Drop the existing constraint first
ALTER TABLE demo_fraud_nodes DROP CONSTRAINT IF EXISTS demo_fraud_nodes_node_type_check;

-- Step 2: Now update the data
UPDATE demo_fraud_nodes SET node_type = 'company' WHERE node_type = 'document';

-- Step 3: Add new constraint with updated values
ALTER TABLE demo_fraud_nodes 
ADD CONSTRAINT demo_fraud_nodes_node_type_check 
CHECK (node_type IN ('applicant', 'agent', 'company', 'address'));