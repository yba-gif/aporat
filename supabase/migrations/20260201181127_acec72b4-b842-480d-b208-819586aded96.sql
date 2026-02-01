-- Create alerts table for real-time notifications
CREATE TABLE public.platform_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  entity_id TEXT,
  case_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_alerts ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view alerts (demo mode)
CREATE POLICY "Anyone can view platform alerts"
ON public.platform_alerts
FOR SELECT
USING (true);

-- Policy: Anyone can insert alerts (demo mode)
CREATE POLICY "Anyone can insert platform alerts"
ON public.platform_alerts
FOR INSERT
WITH CHECK (true);

-- Policy: Anyone can update alerts (for marking as read)
CREATE POLICY "Anyone can update platform alerts"
ON public.platform_alerts
FOR UPDATE
USING (true);

-- Enable Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.platform_alerts;