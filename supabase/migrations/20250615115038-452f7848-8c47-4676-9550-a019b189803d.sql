
-- Create a table to store chat messages
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT,
  audio_url TEXT,
  sender_phone TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Allow anyone to select (read) messages (for now, for demo -- can improve later)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to messages" ON public.messages
  FOR SELECT USING (true);

-- Allow anyone to insert (send) messages (for now)
CREATE POLICY "Allow insert access to messages" ON public.messages
  FOR INSERT WITH CHECK (true);

