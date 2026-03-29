
CREATE TABLE public.face_search_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  search_image_path text,
  potential_name text,
  total_matches integer NOT NULL DEFAULT 0,
  platforms jsonb NOT NULL DEFAULT '[]'::jsonb,
  accounts jsonb NOT NULL DEFAULT '[]'::jsonb,
  raw_results jsonb NOT NULL DEFAULT '[]'::jsonb,
  best_score integer DEFAULT 0,
  testing_mode boolean NOT NULL DEFAULT true,
  searched_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.face_search_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view face searches"
  ON public.face_search_results FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Analysts+ can insert face searches"
  ON public.face_search_results FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'analyst'::app_role) OR
    has_role(auth.uid(), 'supervisor'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role)
  );
