-- Create a table for uploaded media
CREATE TABLE public.uploaded_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.uploaded_media ENABLE ROW LEVEL SECURITY;

-- Create policies for media access
CREATE POLICY "Media is viewable by everyone" 
ON public.uploaded_media 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can upload media" 
ON public.uploaded_media 
FOR INSERT 
WITH CHECK (true);