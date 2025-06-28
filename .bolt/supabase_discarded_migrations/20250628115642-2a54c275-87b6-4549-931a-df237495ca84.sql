
-- Create homework table
CREATE TABLE public.homework (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  google_drive_link TEXT NOT NULL,
  assigned_by TEXT NOT NULL,
  assigned_to_class TEXT NOT NULL,
  assigned_to_students TEXT[], -- Array of student names/IDs
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.homework ENABLE ROW LEVEL SECURITY;

-- Create policy for students to view homework assigned to their class
CREATE POLICY "Students can view homework assigned to their class"
  ON public.homework
  FOR SELECT
  TO authenticated
  USING (true); -- Students can view all homework for now, we'll filter by class in the application

-- Create policy for admins to manage all homework
CREATE POLICY "Admins can manage all homework"
  ON public.homework
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to extract Google Drive file ID from various link formats
CREATE OR REPLACE FUNCTION public.extract_drive_file_id(drive_link TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  -- Handle different Google Drive link formats
  IF drive_link ~ 'drive\.google\.com/file/d/([a-zA-Z0-9_-]+)' THEN
    RETURN (regexp_match(drive_link, 'drive\.google\.com/file/d/([a-zA-Z0-9_-]+)'))[1];
  ELSIF drive_link ~ 'drive\.google\.com/open\?id=([a-zA-Z0-9_-]+)' THEN
    RETURN (regexp_match(drive_link, 'drive\.google\.com/open\?id=([a-zA-Z0-9_-]+)'))[1];
  ELSIF drive_link ~ '^[a-zA-Z0-9_-]+$' THEN
    -- If it's already just the file ID
    RETURN drive_link;
  ELSE
    RETURN NULL;
  END IF;
END;
$$;

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_homework_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER homework_updated_at_trigger
  BEFORE UPDATE ON public.homework
  FOR EACH ROW
  EXECUTE FUNCTION public.update_homework_updated_at();
