-- Enable real-time for public_profiles and messages tables
ALTER TABLE public.public_profiles REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.public_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;