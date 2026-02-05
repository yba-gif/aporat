-- ============================================
-- Phase 1: vizesepetim.com Integration + Data Architecture
-- ============================================

-- 1. vizesepetim_applicants table for incoming external data
CREATE TABLE public.vizesepetim_applicants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT NOT NULL UNIQUE, -- vizesepetim's applicant ID
  mobile_number_hash TEXT NOT NULL, -- SHA-256 hashed for privacy
  ip_address TEXT,
  ip_country TEXT, -- resolved via geolocation
  ip_is_vpn BOOLEAN DEFAULT false, -- VPN/proxy detection flag
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  target_country TEXT NOT NULL,
  linked_entity_id TEXT, -- FK to demo_fraud_nodes.node_id
  processed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vizesepetim_applicants ENABLE ROW LEVEL SECURITY;

-- RLS policies for vizesepetim_applicants
CREATE POLICY "Anyone can view vizesepetim applicants"
ON public.vizesepetim_applicants
FOR SELECT
USING (true);

CREATE POLICY "Service role can insert vizesepetim applicants"
ON public.vizesepetim_applicants
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service role can update vizesepetim applicants"
ON public.vizesepetim_applicants
FOR UPDATE
USING (true);

-- Index for correlation queries
CREATE INDEX idx_vizesepetim_mobile_hash ON public.vizesepetim_applicants(mobile_number_hash);
CREATE INDEX idx_vizesepetim_ip ON public.vizesepetim_applicants(ip_address);
CREATE INDEX idx_vizesepetim_linked_entity ON public.vizesepetim_applicants(linked_entity_id);

-- 2. entity_documents junction table
CREATE TABLE public.entity_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_id TEXT NOT NULL, -- FK to demo_fraud_nodes.node_id
  document_id UUID NOT NULL REFERENCES public.vault_documents(id) ON DELETE CASCADE,
  linked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(entity_id, document_id)
);

-- Enable RLS
ALTER TABLE public.entity_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for entity_documents
CREATE POLICY "Anyone can view entity documents"
ON public.entity_documents
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert entity documents"
ON public.entity_documents
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can delete entity documents"
ON public.entity_documents
FOR DELETE
USING (true);

-- Index for fast lookups
CREATE INDEX idx_entity_documents_entity ON public.entity_documents(entity_id);
CREATE INDEX idx_entity_documents_document ON public.entity_documents(document_id);

-- 3. platform_audit_log table
CREATE TABLE public.platform_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL, -- 'webhook_received', 'entity_created', 'case_decision', etc.
  source TEXT NOT NULL DEFAULT 'system', -- 'vizesepetim', 'system', 'user'
  target_id TEXT, -- entity_id, document_id, case_id, etc.
  target_type TEXT, -- 'entity', 'document', 'case', 'applicant'
  user_role TEXT,
  context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for platform_audit_log
CREATE POLICY "Anyone can view audit logs"
ON public.platform_audit_log
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert audit logs"
ON public.platform_audit_log
FOR INSERT
WITH CHECK (true);

-- Index for audit queries
CREATE INDEX idx_audit_log_action ON public.platform_audit_log(action);
CREATE INDEX idx_audit_log_source ON public.platform_audit_log(source);
CREATE INDEX idx_audit_log_target ON public.platform_audit_log(target_id);
CREATE INDEX idx_audit_log_created ON public.platform_audit_log(created_at DESC);

-- Enable realtime for vizesepetim_applicants (for live demo updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.vizesepetim_applicants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.platform_audit_log;