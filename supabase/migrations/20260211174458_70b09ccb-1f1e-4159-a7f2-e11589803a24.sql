
CREATE TABLE public.social_analyzer_results (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username text NOT NULL,
  total_platforms integer NOT NULL DEFAULT 0,
  platforms jsonb NOT NULL DEFAULT '[]'::jsonb,
  risk_indicators jsonb NOT NULL DEFAULT '[]'::jsonb,
  countries jsonb NOT NULL DEFAULT '[]'::jsonb,
  scanned_at timestamp with time zone NOT NULL DEFAULT now(),
  scanned_by text NULL DEFAULT 'demo'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.social_analyzer_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view social analyzer results"
ON public.social_analyzer_results
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert social analyzer results"
ON public.social_analyzer_results
FOR INSERT
WITH CHECK (true);

CREATE INDEX idx_social_analyzer_username ON public.social_analyzer_results (username);
CREATE INDEX idx_social_analyzer_created ON public.social_analyzer_results (created_at DESC);
