
-- Create storage bucket for document vault
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'document-vault',
  'document-vault',
  true,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Create RLS policies for the bucket
CREATE POLICY "Anyone can view documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'document-vault');

CREATE POLICY "Anyone can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'document-vault');

-- Create a table to track document metadata with integrity hashes
CREATE TABLE public.vault_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  sha256_hash TEXT NOT NULL,
  ocr_status TEXT DEFAULT 'pending' CHECK (ocr_status IN ('pending', 'processing', 'completed', 'failed')),
  ocr_confidence NUMERIC(5,2),
  extracted_text TEXT,
  metadata JSONB DEFAULT '{}',
  flagged BOOLEAN DEFAULT false,
  risk_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vault_documents ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view and insert documents (demo mode)
CREATE POLICY "Anyone can view vault documents"
ON public.vault_documents FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert vault documents"
ON public.vault_documents FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update vault documents"
ON public.vault_documents FOR UPDATE
USING (true);
