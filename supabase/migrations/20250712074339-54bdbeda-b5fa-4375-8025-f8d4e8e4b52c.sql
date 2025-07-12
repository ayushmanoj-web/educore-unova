-- Create clubs table
CREATE TABLE public.clubs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create club applications table
CREATE TABLE public.club_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES public.clubs(id),
  student_id UUID NOT NULL,
  student_name TEXT NOT NULL,
  student_class TEXT NOT NULL,
  student_division TEXT NOT NULL,
  student_phone TEXT NOT NULL,
  application_details TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create club chat messages table (separate from regular chat)
CREATE TABLE public.club_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES public.clubs(id),
  sender_id UUID NOT NULL,
  sender_name TEXT NOT NULL,
  sender_image TEXT,
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for clubs
CREATE POLICY "Anyone can view clubs" ON public.clubs FOR SELECT USING (true);
CREATE POLICY "Anyone can insert clubs" ON public.clubs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update clubs" ON public.clubs FOR UPDATE USING (true);

-- Create policies for club applications
CREATE POLICY "Anyone can view club applications" ON public.club_applications FOR SELECT USING (true);
CREATE POLICY "Anyone can insert club applications" ON public.club_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update club applications" ON public.club_applications FOR UPDATE USING (true);

-- Create policies for club chat messages
CREATE POLICY "Anyone can view club chat messages" ON public.club_chat_messages FOR SELECT USING (true);
CREATE POLICY "Anyone can insert club chat messages" ON public.club_chat_messages FOR INSERT WITH CHECK (true);

-- Insert default clubs
INSERT INTO public.clubs (name, description) VALUES
('Little Kites', 'Little Kites Club for young enthusiasts'),
('SPC', 'Student Police Cadet program'),
('JRC', 'Junior Red Cross activities'),
('Maths Club', 'Mathematics and problem solving club'),
('Media Club', 'Media and journalism club'),
('Hindi Club', 'Hindi language and literature club'),
('SS Club', 'Social Science club'),
('Scout and Guides', 'Scouting and guiding activities'),
('Science Club', 'Science experiments and projects club');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for clubs table
CREATE TRIGGER update_clubs_updated_at
  BEFORE UPDATE ON public.clubs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();