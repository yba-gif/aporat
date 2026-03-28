
-- V3 Cases table
CREATE TABLE public.v3_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id TEXT UNIQUE NOT NULL,
  applicant JSONB NOT NULL,
  application_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  consulate_location TEXT NOT NULL DEFAULT 'Istanbul',
  travel_destination TEXT NOT NULL DEFAULT 'Schengen',
  risk_score NUMERIC NOT NULL DEFAULT 0,
  risk_level TEXT NOT NULL DEFAULT 'low',
  risk_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  risk_factors JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'new',
  assigned_officer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- V3 OSINT Findings
CREATE TABLE public.v3_osint_findings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.v3_cases(id) ON DELETE CASCADE NOT NULL,
  source TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  detail TEXT NOT NULL,
  url TEXT DEFAULT '',
  confidence INTEGER DEFAULT 0,
  risk_impact TEXT DEFAULT 'none',
  timestamp TIMESTAMPTZ DEFAULT now(),
  evidence JSONB DEFAULT '{}'::jsonb
);

-- V3 Case Documents
CREATE TABLE public.v3_case_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.v3_cases(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  file_path TEXT DEFAULT '',
  ocr_status TEXT DEFAULT 'pending',
  extracted_fields JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- V3 Case Events (timeline)
CREATE TABLE public.v3_case_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.v3_cases(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  user_name TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- V3 OSINT Scans
CREATE TABLE public.v3_osint_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.v3_cases(id) ON DELETE SET NULL,
  scan_type TEXT NOT NULL DEFAULT 'visa',
  target_name TEXT NOT NULL,
  target_email TEXT,
  target_username TEXT,
  status TEXT NOT NULL DEFAULT 'queued',
  progress INTEGER DEFAULT 0,
  tools_used JSONB DEFAULT '[]'::jsonb,
  results JSONB DEFAULT '{}'::jsonb,
  findings_count INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  error TEXT
);

-- V3 Defence Scans
CREATE TABLE public.v3_defence_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_id TEXT UNIQUE NOT NULL,
  scan_type TEXT NOT NULL DEFAULT 'batch',
  personnel_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'queued',
  progress INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- V3 Personnel Results
CREATE TABLE public.v3_personnel (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  defence_scan_id UUID REFERENCES public.v3_defence_scans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rank TEXT NOT NULL,
  unit TEXT NOT NULL,
  branch TEXT NOT NULL,
  profiles_found INTEGER DEFAULT 0,
  opsec_violations JSONB DEFAULT '[]'::jsonb,
  overall_risk TEXT DEFAULT 'low',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_v3_cases_status ON public.v3_cases(status);
CREATE INDEX idx_v3_cases_risk_level ON public.v3_cases(risk_level);
CREATE INDEX idx_v3_cases_case_id ON public.v3_cases(case_id);
CREATE INDEX idx_v3_findings_case_id ON public.v3_osint_findings(case_id);
CREATE INDEX idx_v3_documents_case_id ON public.v3_case_documents(case_id);
CREATE INDEX idx_v3_events_case_id ON public.v3_case_events(case_id);
CREATE INDEX idx_v3_scans_case_id ON public.v3_osint_scans(case_id);

-- Enable RLS
ALTER TABLE public.v3_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v3_osint_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v3_case_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v3_case_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v3_osint_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v3_defence_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v3_personnel ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Authenticated users can read all V3 data
CREATE POLICY "Authenticated can view cases" ON public.v3_cases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Analysts+ can insert cases" ON public.v3_cases FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'analyst'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Analysts+ can update cases" ON public.v3_cases FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'analyst'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated can view findings" ON public.v3_osint_findings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Analysts+ can insert findings" ON public.v3_osint_findings FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'analyst'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated can view documents" ON public.v3_case_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Analysts+ can insert documents" ON public.v3_case_documents FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'analyst'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated can view events" ON public.v3_case_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Analysts+ can insert events" ON public.v3_case_events FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'analyst'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated can view scans" ON public.v3_osint_scans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Analysts+ can insert scans" ON public.v3_osint_scans FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'analyst'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Analysts+ can update scans" ON public.v3_osint_scans FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'analyst'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated can view defence scans" ON public.v3_defence_scans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Analysts+ can insert defence scans" ON public.v3_defence_scans FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'analyst'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated can view personnel" ON public.v3_personnel FOR SELECT TO authenticated USING (true);
CREATE POLICY "Analysts+ can insert personnel" ON public.v3_personnel FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'analyst'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for cases and events
ALTER PUBLICATION supabase_realtime ADD TABLE public.v3_cases;
ALTER PUBLICATION supabase_realtime ADD TABLE public.v3_case_events;
