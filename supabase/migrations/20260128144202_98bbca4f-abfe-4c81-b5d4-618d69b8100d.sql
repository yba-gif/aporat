-- Demo tables for Nautica fraud network visualization

-- Fraud network nodes (applicants, agents, documents, addresses)
CREATE TABLE public.demo_fraud_nodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  node_id TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  node_type TEXT NOT NULL CHECK (node_type IN ('applicant', 'agent', 'document', 'address')),
  flagged BOOLEAN DEFAULT false,
  risk_score INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Fraud network edges (relationships between nodes)
CREATE TABLE public.demo_fraud_edges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_node_id TEXT NOT NULL,
  target_node_id TEXT NOT NULL,
  edge_type TEXT NOT NULL CHECK (edge_type IN ('submitted', 'uses', 'linked', 'located')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(source_node_id, target_node_id, edge_type)
);

-- Enable RLS but allow public read for demo
ALTER TABLE public.demo_fraud_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_fraud_edges ENABLE ROW LEVEL SECURITY;

-- Anyone can view demo data (it's mock data for demonstrations)
CREATE POLICY "Anyone can view demo fraud nodes" 
ON public.demo_fraud_nodes 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view demo fraud edges" 
ON public.demo_fraud_edges 
FOR SELECT 
USING (true);