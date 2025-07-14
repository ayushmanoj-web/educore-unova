-- Create chat rooms table (new)
CREATE TABLE public.chat_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_group BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat participants table (new)
CREATE TABLE public.chat_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_admin BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(chat_room_id, user_id)
);

-- Create user profiles table for user management
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  is_online BOOLEAN NOT NULL DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update existing chat_messages table to work with our new system
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS chat_room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE;
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'audio', 'file'));
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS file_size INTEGER;
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS file_type TEXT;
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS replied_to UUID REFERENCES public.chat_messages(id);
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;

-- Enable Row Level Security
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for chat_rooms
CREATE POLICY "Users can view chats they participate in" ON public.chat_rooms
  FOR SELECT USING (
    id IN (
      SELECT chat_room_id FROM public.chat_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create chat rooms" ON public.chat_rooms
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- Create policies for chat_participants
CREATE POLICY "Users can view participants in their chats" ON public.chat_participants
  FOR SELECT USING (
    chat_room_id IN (
      SELECT chat_room_id FROM public.chat_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join chats" ON public.chat_participants
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create policies for user_profiles
CREATE POLICY "Anyone can view user profiles" ON public.user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (user_id = auth.uid());

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('chat-files', 'chat-files', false),
  ('chat-avatars', 'chat-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Users can upload chat files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'chat-files' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view chat files" ON storage.objects
  FOR SELECT USING (bucket_id = 'chat-files');

CREATE POLICY "Users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'chat-avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]  
  );

CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'chat-avatars');

-- Create indexes for better performance
CREATE INDEX idx_chat_participants_user ON public.chat_participants(user_id);
CREATE INDEX idx_user_profiles_user ON public.user_profiles(user_id);

-- Enable realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_profiles;