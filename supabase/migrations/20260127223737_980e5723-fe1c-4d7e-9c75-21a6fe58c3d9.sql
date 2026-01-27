-- Create contact_submissions table for storing contact form data
CREATE TABLE public.contact_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization TEXT NOT NULL,
  role TEXT NOT NULL,
  message TEXT,
  request_pilot BOOLEAN DEFAULT false,
  request_security_brief BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create open_positions table
CREATE TABLE public.open_positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  department TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create job_applications table
CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  position_id UUID REFERENCES public.open_positions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  linkedin_url TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.open_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Public can insert contact submissions (no auth required for contact form)
CREATE POLICY "Anyone can submit contact form"
  ON public.contact_submissions
  FOR INSERT
  WITH CHECK (true);

-- Public can read active positions
CREATE POLICY "Anyone can view active positions"
  ON public.open_positions
  FOR SELECT
  USING (is_active = true);

-- Public can submit job applications
CREATE POLICY "Anyone can submit job applications"
  ON public.job_applications
  FOR INSERT
  WITH CHECK (true);

-- Insert initial positions in Türkiye
INSERT INTO public.open_positions (title, location, department) VALUES
  ('Senior Backend Engineer', 'İstanbul, Türkiye', 'Engineering'),
  ('Product Designer', 'İstanbul, Türkiye', 'Design'),
  ('ML Engineer', 'Remote / Türkiye', 'Engineering'),
  ('DevOps Engineer', 'Ankara, Türkiye', 'Infrastructure');