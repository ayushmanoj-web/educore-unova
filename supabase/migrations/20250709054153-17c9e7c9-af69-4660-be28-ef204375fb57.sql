-- Create public_profiles table for storing student profiles
CREATE TABLE public.public_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  division TEXT NOT NULL,
  dob TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on public_profiles
ALTER TABLE public.public_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for public_profiles (public read access for teachers)
CREATE POLICY "Anyone can view public profiles" 
ON public.public_profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert public profiles" 
ON public.public_profiles 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update public profiles" 
ON public.public_profiles 
FOR UPDATE 
USING (true);

-- Create leave_applications table
CREATE TABLE public.leave_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  student_class TEXT NOT NULL,
  student_division TEXT NOT NULL,
  student_dob TEXT NOT NULL,
  student_phone TEXT NOT NULL,
  student_image TEXT,
  number_of_days INTEGER NOT NULL,
  start_date DATE NOT NULL,
  return_date DATE NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on leave_applications
ALTER TABLE public.leave_applications ENABLE ROW LEVEL SECURITY;

-- Create policies for leave_applications
CREATE POLICY "Anyone can view leave applications" 
ON public.leave_applications 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert leave applications" 
ON public.leave_applications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update leave applications" 
ON public.leave_applications 
FOR UPDATE 
USING (true);

-- Create function to send notification when leave is submitted
CREATE OR REPLACE FUNCTION public.notify_teacher_on_leave_submission()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for teacher
  INSERT INTO public.notifications (
    title,
    message,
    sender_id,
    recipient_id,
    role
  ) VALUES (
    'New Leave Application',
    'New leave application from ' || NEW.student_name || ' (Class: ' || NEW.student_class || ', Division: ' || NEW.student_division || ') for ' || NEW.number_of_days || ' days from ' || NEW.start_date || ' to ' || NEW.return_date || '. Reason: ' || NEW.reason,
    null,
    null,
    'teacher'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically send notification when leave is submitted
CREATE TRIGGER trigger_notify_teacher_on_leave_submission
  AFTER INSERT ON public.leave_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_teacher_on_leave_submission();

-- Add RLS policies for notifications table (if not already present)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Anyone can view notifications" 
ON public.notifications 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update notifications" 
ON public.notifications 
FOR UPDATE 
USING (true);