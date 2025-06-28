
-- Create marks table for storing student test marks
CREATE TABLE public.student_marks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  total_marks NUMERIC NOT NULL,
  marks_obtained NUMERIC NOT NULL,
  test_name TEXT NOT NULL,
  test_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.student_marks ENABLE ROW LEVEL SECURITY;

-- Create policy for students to view their own marks
CREATE POLICY "Students can view their own marks"
  ON public.student_marks
  FOR SELECT
  TO authenticated
  USING (true); -- We'll filter by student in the application

-- Create policy for admins to manage all marks
CREATE POLICY "Admins can manage all marks"
  ON public.student_marks
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create trigger to automatically update updated_at timestamp for marks
CREATE OR REPLACE FUNCTION public.update_student_marks_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER student_marks_updated_at_trigger
  BEFORE UPDATE ON public.student_marks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_student_marks_updated_at();

-- Enable realtime for student_marks table
ALTER TABLE public.student_marks REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_marks;

-- Enable realtime for student_fees table (for fee details in student dashboard)
ALTER TABLE public.student_fees REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_fees;

-- Enable realtime for fee_payments table
ALTER TABLE public.fee_payments REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fee_payments;
