-- Add sender_phone column to chat_messages table to link messages to profiles
ALTER TABLE public.chat_messages 
ADD COLUMN sender_phone TEXT;

-- Create index for better performance when looking up messages by sender_phone
CREATE INDEX idx_chat_messages_sender_phone ON public.chat_messages(sender_phone);