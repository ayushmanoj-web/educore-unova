
-- Create a profiles table to store user profile data across devices
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  division TEXT NOT NULL,
  dob DATE NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  image TEXT, -- base64 string for profile image
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only see their own profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own profile
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to INSERT their own profile
CREATE POLICY "Users can create their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to UPDATE their own profile
CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to DELETE their own profile
CREATE POLICY "Users can delete their own profile" 
  ON public.profiles 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create an index on phone number for faster lookups
CREATE INDEX idx_profiles_phone ON public.profiles(phone);

-- Create an index on user_id for faster lookups
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
