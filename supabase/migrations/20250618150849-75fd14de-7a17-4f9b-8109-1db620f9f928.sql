
-- Create notifications table to store all notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'student',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy for users to view notifications sent to them
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = recipient_id);

-- Policy for teachers to create notifications (assuming teachers have a specific role or we identify them differently)
CREATE POLICY "Teachers can create notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

-- Policy for users to update read status of their notifications
CREATE POLICY "Users can update read status of their notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = recipient_id);

-- Create an index for faster notification queries
CREATE INDEX idx_notifications_recipient_timestamp ON public.notifications(recipient_id, timestamp DESC);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
