-- Create teachers table for teacher profiles
CREATE TABLE public.teachers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  class text NOT NULL,
  division text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- Create policies for teachers table
CREATE POLICY "Anyone can insert teacher profiles" 
ON public.teachers 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view teacher profiles" 
ON public.teachers 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update teacher profiles" 
ON public.teachers 
FOR UPDATE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_teachers_updated_at
BEFORE UPDATE ON public.teachers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();