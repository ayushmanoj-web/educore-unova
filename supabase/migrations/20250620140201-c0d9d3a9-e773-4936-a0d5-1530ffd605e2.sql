
-- Enable real-time for chat_messages table
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;

-- Add the table to the realtime publication (this enables real-time updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Also enable real-time for profiles table so profile changes sync
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_name ON public.profiles(name);
