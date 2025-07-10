-- Create teacher_student_assignments table for access control
CREATE TABLE public.teacher_student_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL,
  student_id UUID NOT NULL,
  subject TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(teacher_id, student_id, subject)
);

-- Create messages table for chat functionality
CREATE TABLE public.messages_chat (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  message_text TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_read BOOLEAN NOT NULL DEFAULT false
);

-- Create test_scores table for progress tracking
CREATE TABLE public.test_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  subject TEXT NOT NULL,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  test_name TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create homework_status table for progress tracking
CREATE TABLE public.homework_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  assignment_id TEXT NOT NULL,
  assignment_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  submitted BOOLEAN NOT NULL DEFAULT false,
  due_date DATE NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.teacher_student_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teacher_student_assignments
CREATE POLICY "Anyone can view teacher student assignments" 
ON public.teacher_student_assignments 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert teacher student assignments" 
ON public.teacher_student_assignments 
FOR INSERT 
WITH CHECK (true);

-- RLS Policies for messages_chat
CREATE POLICY "Users can view their own messages" 
ON public.messages_chat 
FOR SELECT 
USING (true);

CREATE POLICY "Users can send messages" 
ON public.messages_chat 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own messages" 
ON public.messages_chat 
FOR UPDATE 
USING (true);

-- RLS Policies for test_scores
CREATE POLICY "Anyone can view test scores" 
ON public.test_scores 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert test scores" 
ON public.test_scores 
FOR INSERT 
WITH CHECK (true);

-- RLS Policies for homework_status
CREATE POLICY "Anyone can view homework status" 
ON public.homework_status 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert homework status" 
ON public.homework_status 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update homework status" 
ON public.homework_status 
FOR UPDATE 
USING (true);

-- Enable realtime for messages_chat table
ALTER TABLE public.messages_chat REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages_chat;