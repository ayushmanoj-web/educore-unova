/*
  # Create leave applications table

  1. New Tables
    - `leave_applications` - stores student leave requests with full profile details
      - `id` (uuid, primary key)
      - `student_name` (text)
      - `student_class` (text)
      - `student_division` (text)
      - `student_dob` (date)
      - `student_phone` (text)
      - `student_image` (text, nullable)
      - `number_of_days` (integer)
      - `start_date` (date)
      - `return_date` (date)
      - `reason` (text)
      - `status` (text, default 'pending')
      - `submitted_at` (timestamp)
      - `reviewed_at` (timestamp, nullable)
      - `reviewed_by` (text, nullable)

  2. Security
    - No RLS - completely public access for teachers to view all applications
    - Students can submit applications without authentication

  3. Changes
    - Creates a separate system for leave applications
    - Allows teachers to view and manage all leave requests
    - Keeps leave applications separate from notifications
*/

-- Create leave_applications table
CREATE TABLE IF NOT EXISTS public.leave_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  student_class TEXT NOT NULL,
  student_division TEXT NOT NULL,
  student_dob DATE NOT NULL,
  student_phone TEXT NOT NULL,
  student_image TEXT, -- base64 string for profile image
  number_of_days INTEGER NOT NULL,
  start_date DATE NOT NULL,
  return_date DATE NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leave_applications_status ON public.leave_applications(status);
CREATE INDEX IF NOT EXISTS idx_leave_applications_submitted_at ON public.leave_applications(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_leave_applications_student_phone ON public.leave_applications(student_phone);

-- Enable real-time for leave_applications table
ALTER TABLE public.leave_applications REPLICA IDENTITY FULL;

-- Add the table to the realtime publication
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.leave_applications;
  END IF;
END $$;