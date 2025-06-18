
-- Remove RLS policies from notifications table to make it public
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Teachers can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update read status of their notifications" ON public.notifications;

-- Disable RLS on notifications table
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

-- Create a chat messages table for the live chat
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_image TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Make chat messages public (no authentication required)
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read chat messages
CREATE POLICY "Anyone can view chat messages" 
  ON public.chat_messages 
  FOR SELECT 
  USING (true);

-- Allow everyone to insert chat messages
CREATE POLICY "Anyone can create chat messages" 
  ON public.chat_messages 
  FOR INSERT 
  WITH CHECK (true);

-- Create an index for faster chat message queries
CREATE INDEX idx_chat_messages_timestamp ON public.chat_messages(timestamp DESC);
