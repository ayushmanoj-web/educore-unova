-- Add columns to store student information with messages
ALTER TABLE public.messages_chat 
ADD COLUMN sender_name TEXT,
ADD COLUMN sender_class TEXT,
ADD COLUMN sender_division TEXT;