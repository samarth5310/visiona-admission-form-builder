
-- Create storage bucket for form documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('form-documents', 'form-documents', true);

-- Create applications table to store form data
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admission_number TEXT NOT NULL,
  admission_type TEXT NOT NULL,
  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL,
  current_school TEXT NOT NULL,
  class TEXT NOT NULL,
  aadhaar_number TEXT NOT NULL,
  father_name TEXT NOT NULL,
  mother_name TEXT NOT NULL,
  father_occupation TEXT NOT NULL,
  mother_occupation TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  email TEXT NOT NULL,
  sats_number TEXT NOT NULL,
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pin_code TEXT NOT NULL,
  landmark TEXT,
  last_year_percentage DECIMAL(5,2) NOT NULL,
  subjects_weak_in TEXT,
  category TEXT NOT NULL,
  exams_preparing_for TEXT[] NOT NULL,
  payment_mode TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  amount_paid DECIMAL(10,2) NOT NULL,
  place TEXT NOT NULL,
  declaration_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create application_documents table to store file paths
CREATE TABLE public.application_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- 'student_photo', 'previous_marksheet', 'aadhaar_card', 'income_certificate', 'caste_certificate'
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage policies for form-documents bucket
CREATE POLICY "Anyone can view form documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'form-documents');

CREATE POLICY "Anyone can upload form documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'form-documents');

CREATE POLICY "Anyone can update form documents" ON storage.objects
  FOR UPDATE USING (bucket_id = 'form-documents');

CREATE POLICY "Anyone can delete form documents" ON storage.objects
  FOR DELETE USING (bucket_id = 'form-documents');

-- Enable RLS on applications table
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Create policy for applications (public access for demo purposes)
CREATE POLICY "Anyone can view applications" ON public.applications
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create applications" ON public.applications
  FOR INSERT WITH CHECK (true);

-- Enable RLS on application_documents table
ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;

-- Create policy for application_documents (public access for demo purposes)
CREATE POLICY "Anyone can view application documents" ON public.application_documents
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create application documents" ON public.application_documents
  FOR INSERT WITH CHECK (true);
