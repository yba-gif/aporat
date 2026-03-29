CREATE TABLE public.v3_case_narratives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.v3_cases(id) ON DELETE CASCADE,
  narrative text NOT NULL,
  generated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(case_id)
);

ALTER TABLE public.v3_case_narratives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view narratives"
  ON public.v3_case_narratives FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Analysts+ can insert narratives"
  ON public.v3_case_narratives FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'analyst'::app_role) OR
    has_role(auth.uid(), 'supervisor'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Analysts+ can update narratives"
  ON public.v3_case_narratives FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), 'analyst'::app_role) OR
    has_role(auth.uid(), 'supervisor'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role)
  );