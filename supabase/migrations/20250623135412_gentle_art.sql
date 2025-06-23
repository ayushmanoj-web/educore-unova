/*
  # Create public profiles system

  1. New Tables
    - `public_profiles` - stores all student profiles without authentication
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `class` (text)
      - `division` (text)
      - `dob` (date)
      - `phone` (text, unique)
      - `image` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - No RLS - completely public access
    - Anyone can read, insert, update profiles
    - Unique constraints on name and phone to prevent duplicates

  3. Changes
    - Creates a public alternative to the authenticated profiles table
    - Allows students to save profiles without authentication
    - Allows teachers to view all student profiles
*/

-- Create public_profiles table for unauthenticated profile storage
CREATE TABLE IF NOT EXISTS public.public_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  class TEXT NOT NULL,
  division TEXT NOT NULL,
  dob DATE NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  image TEXT, -- base64 string for profile image
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_public_profiles_name ON public.public_profiles(name);
CREATE INDEX IF NOT EXISTS idx_public_profiles_phone ON public.public_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_public_profiles_class_division ON public.public_profiles(class, division);

-- Enable real-time for public_profiles table
ALTER TABLE public.public_profiles REPLICA IDENTITY FULL;

-- Add the table to the realtime publication
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.public_profiles;
  END IF;
END $$;