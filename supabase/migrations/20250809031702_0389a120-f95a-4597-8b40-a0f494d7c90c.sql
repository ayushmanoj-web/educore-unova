-- Create table for teacher-student messages if it doesn't exist
CREATE TABLE IF NOT EXISTS public.teacher_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_name TEXT NOT NULL,
  teacher_phone TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_class TEXT NOT NULL,
  student_division TEXT NOT NULL,
  student_phone TEXT NOT NULL,
  message_text TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.teacher_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for teacher messages
CREATE POLICY "Anyone can insert teacher messages" 
ON public.teacher_messages 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view teacher messages" 
ON public.teacher_messages 
FOR SELECT 
USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_teacher_messages_teacher_phone ON public.teacher_messages(teacher_phone);
CREATE INDEX IF NOT EXISTS idx_teacher_messages_timestamp ON public.teacher_messages(timestamp DESC);