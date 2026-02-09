
-- Table to persist OSINT scan results for audit trails
CREATE TABLE public.osint_scan_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id text NOT NULL,
  entity_name text NOT NULL,
  scan_type text NOT NULL DEFAULT 'combined',
  
  -- xAI Grok results
  ai_risk_assessment text,
  ai_findings jsonb DEFAULT '[]'::jsonb,
  ai_recommended_actions jsonb DEFAULT '[]'::jsonb,
  ai_confidence numeric,
  
  -- Perplexity web intel results
  web_results jsonb DEFAULT '[]'::jsonb,
  web_citations jsonb DEFAULT '[]'::jsonb,
  
  -- Metadata
  scanned_by text DEFAULT 'demo',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.osint_scan_results ENABLE ROW LEVEL SECURITY;

-- Anyone can view (demo mode)
CREATE POLICY "Anyone can view osint scan results"
  ON public.osint_scan_results FOR SELECT
  USING (true);

-- Anyone can insert (demo mode, no auth required)
CREATE POLICY "Anyone can insert osint scan results"
  ON public.osint_scan_results FOR INSERT
  WITH CHECK (true);
