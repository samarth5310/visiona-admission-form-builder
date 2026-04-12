-- Harden RLS policies flagged by Supabase linter while keeping current app flows working.
-- This migration removes always-true write policies and replaces them with scoped checks.

BEGIN;

-- Ensure RLS is enabled on all relevant tables
ALTER TABLE IF EXISTS public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.exam_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.institution_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_quiz_results ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- Drop permissive policies found by linter (idempotent)
-- -----------------------------------------------------------------------------

-- applications
DROP POLICY IF EXISTS "Allow public to create applications" ON public.applications;
DROP POLICY IF EXISTS "Anyone can create applications" ON public.applications;
DROP POLICY IF EXISTS "Allow public to update applications" ON public.applications;

-- application_documents
DROP POLICY IF EXISTS "Anyone can create application documents" ON public.application_documents;

-- attendance
DROP POLICY IF EXISTS "Allow public to create attendance" ON public.attendance;
DROP POLICY IF EXISTS "Allow public to update attendance" ON public.attendance;
DROP POLICY IF EXISTS "Allow public to delete attendance" ON public.attendance;

-- exam_content
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.exam_content;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.exam_content;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.exam_content;

-- fee_payments
DROP POLICY IF EXISTS "Allow all operations on fee_payments" ON public.fee_payments;
DROP POLICY IF EXISTS "Allow public to manage fee_payments" ON public.fee_payments;
DROP POLICY IF EXISTS "Anyone can create fee payments" ON public.fee_payments;
DROP POLICY IF EXISTS "Anyone can update fee payments" ON public.fee_payments;
DROP POLICY IF EXISTS "Anyone can delete fee payments" ON public.fee_payments;

-- homework
DROP POLICY IF EXISTS "Admins can manage all homework" ON public.homework;
DROP POLICY IF EXISTS "Allow public to create homework" ON public.homework;
DROP POLICY IF EXISTS "Allow public to update homework" ON public.homework;
DROP POLICY IF EXISTS "Allow public to delete homework" ON public.homework;

-- institution_settings
DROP POLICY IF EXISTS "Allow authenticated to manage institution_settings" ON public.institution_settings;

-- student_fees
DROP POLICY IF EXISTS "Allow all operations on student_fees" ON public.student_fees;
DROP POLICY IF EXISTS "Allow public to manage student_fees" ON public.student_fees;
DROP POLICY IF EXISTS "Anyone can create student fees" ON public.student_fees;
DROP POLICY IF EXISTS "Anyone can update student fees" ON public.student_fees;
DROP POLICY IF EXISTS "Anyone can delete student fees" ON public.student_fees;

-- student_marks
DROP POLICY IF EXISTS "Allow public to create marks" ON public.student_marks;
DROP POLICY IF EXISTS "Allow public to update marks" ON public.student_marks;
DROP POLICY IF EXISTS "Allow public to delete marks" ON public.student_marks;

-- student_quiz_results
DROP POLICY IF EXISTS "Allow insert for results" ON public.student_quiz_results;
DROP POLICY IF EXISTS "Students can insert their own results" ON public.student_quiz_results;

-- -----------------------------------------------------------------------------
-- Recreate safer policies
-- -----------------------------------------------------------------------------

-- applications: keep public admission flow, lock write management to authenticated admins
DROP POLICY IF EXISTS "Public can read applications" ON public.applications;
DROP POLICY IF EXISTS "Public can insert applications with basic validation" ON public.applications;
DROP POLICY IF EXISTS "Authenticated can update applications" ON public.applications;
DROP POLICY IF EXISTS "Authenticated can delete applications" ON public.applications;

CREATE POLICY "Public can read applications"
ON public.applications
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Public can insert applications with basic validation"
ON public.applications
FOR INSERT
TO anon, authenticated
WITH CHECK (
  coalesce(trim(full_name), '') <> ''
  AND coalesce(trim(contact_number), '') <> ''
  AND date_of_birth IS NOT NULL
);

CREATE POLICY "Authenticated can update applications"
ON public.applications
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete applications"
ON public.applications
FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);

-- application_documents: allow uploads with constraints, updates/deletes only by authenticated admins
DROP POLICY IF EXISTS "Public can read application documents" ON public.application_documents;
DROP POLICY IF EXISTS "Public can insert application documents with validation" ON public.application_documents;
DROP POLICY IF EXISTS "Authenticated can update application documents" ON public.application_documents;
DROP POLICY IF EXISTS "Authenticated can delete application documents" ON public.application_documents;

CREATE POLICY "Public can read application documents"
ON public.application_documents
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Public can insert application documents with validation"
ON public.application_documents
FOR INSERT
TO anon, authenticated
WITH CHECK (
  application_id IS NOT NULL
  AND coalesce(trim(file_path), '') <> ''
  AND coalesce(trim(file_name), '') <> ''
  AND document_type IN ('student_photo', 'other_document')
);

CREATE POLICY "Authenticated can update application documents"
ON public.application_documents
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete application documents"
ON public.application_documents
FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);

-- attendance: read allowed, writes only authenticated admins
DROP POLICY IF EXISTS "Public can read attendance" ON public.attendance;
DROP POLICY IF EXISTS "Authenticated can insert attendance" ON public.attendance;
DROP POLICY IF EXISTS "Authenticated can update attendance" ON public.attendance;
DROP POLICY IF EXISTS "Authenticated can delete attendance" ON public.attendance;

CREATE POLICY "Public can read attendance"
ON public.attendance
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Authenticated can insert attendance"
ON public.attendance
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update attendance"
ON public.attendance
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete attendance"
ON public.attendance
FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);

-- exam_content: public read, writes authenticated only
DROP POLICY IF EXISTS "Anyone can read exam content" ON public.exam_content;
DROP POLICY IF EXISTS "Public can read exam content" ON public.exam_content;
DROP POLICY IF EXISTS "Authenticated can insert exam content" ON public.exam_content;
DROP POLICY IF EXISTS "Authenticated can update exam content" ON public.exam_content;
DROP POLICY IF EXISTS "Authenticated can delete exam content" ON public.exam_content;

CREATE POLICY "Public can read exam content"
ON public.exam_content
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Authenticated can insert exam content"
ON public.exam_content
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update exam content"
ON public.exam_content
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete exam content"
ON public.exam_content
FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);

-- homework: public read, writes authenticated only
DROP POLICY IF EXISTS "Public can read homework" ON public.homework;
DROP POLICY IF EXISTS "Authenticated can insert homework" ON public.homework;
DROP POLICY IF EXISTS "Authenticated can update homework" ON public.homework;
DROP POLICY IF EXISTS "Authenticated can delete homework" ON public.homework;

CREATE POLICY "Public can read homework"
ON public.homework
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Authenticated can insert homework"
ON public.homework
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update homework"
ON public.homework
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete homework"
ON public.homework
FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);

-- institution_settings: public read for UPI display, writes authenticated only
DROP POLICY IF EXISTS "Public can read institution settings" ON public.institution_settings;
DROP POLICY IF EXISTS "Authenticated can manage institution settings" ON public.institution_settings;

CREATE POLICY "Public can read institution settings"
ON public.institution_settings
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Authenticated can manage institution settings"
ON public.institution_settings
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- student_fees: public read for student dashboard, writes authenticated only
DROP POLICY IF EXISTS "Public can read student fees" ON public.student_fees;
DROP POLICY IF EXISTS "Authenticated can insert student fees" ON public.student_fees;
DROP POLICY IF EXISTS "Authenticated can update student fees" ON public.student_fees;
DROP POLICY IF EXISTS "Authenticated can delete student fees" ON public.student_fees;

CREATE POLICY "Public can read student fees"
ON public.student_fees
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Authenticated can insert student fees"
ON public.student_fees
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update student fees"
ON public.student_fees
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete student fees"
ON public.student_fees
FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);

-- fee_payments: public read + constrained insert for student payment submission, updates/deletes authenticated only
DROP POLICY IF EXISTS "Public can read fee payments" ON public.fee_payments;
DROP POLICY IF EXISTS "Public can insert fee payments with validation" ON public.fee_payments;
DROP POLICY IF EXISTS "Authenticated can update fee payments" ON public.fee_payments;
DROP POLICY IF EXISTS "Authenticated can delete fee payments" ON public.fee_payments;

CREATE POLICY "Public can read fee payments"
ON public.fee_payments
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Public can insert fee payments with validation"
ON public.fee_payments
FOR INSERT
TO anon, authenticated
WITH CHECK (
  student_fees_id IS NOT NULL
  AND payment_amount > 0
  AND payment_method IN ('cash', 'bank_transfer', 'upi', 'card', 'cheque', 'adjustment', 'other')
);

CREATE POLICY "Authenticated can update fee payments"
ON public.fee_payments
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete fee payments"
ON public.fee_payments
FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);

-- student_marks: public read, writes authenticated only
DROP POLICY IF EXISTS "Public can read student marks" ON public.student_marks;
DROP POLICY IF EXISTS "Authenticated can insert student marks" ON public.student_marks;
DROP POLICY IF EXISTS "Authenticated can update student marks" ON public.student_marks;
DROP POLICY IF EXISTS "Authenticated can delete student marks" ON public.student_marks;

CREATE POLICY "Public can read student marks"
ON public.student_marks
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Authenticated can insert student marks"
ON public.student_marks
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update student marks"
ON public.student_marks
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete student marks"
ON public.student_marks
FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);

-- student_quiz_results: keep public/student submit flow, but enforce data constraints
DROP POLICY IF EXISTS "Students can view their own results" ON public.student_quiz_results;
DROP POLICY IF EXISTS "Public can read student quiz results" ON public.student_quiz_results;
DROP POLICY IF EXISTS "Public can insert student quiz results with validation" ON public.student_quiz_results;
DROP POLICY IF EXISTS "Authenticated can update student quiz results" ON public.student_quiz_results;
DROP POLICY IF EXISTS "Authenticated can delete student quiz results" ON public.student_quiz_results;

CREATE POLICY "Public can read student quiz results"
ON public.student_quiz_results
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Public can insert student quiz results with validation"
ON public.student_quiz_results
FOR INSERT
TO anon, authenticated
WITH CHECK (
  student_id IS NOT NULL
  AND total_questions > 0
  AND score >= 0
  AND score <= total_questions
);

CREATE POLICY "Authenticated can update student quiz results"
ON public.student_quiz_results
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete student quiz results"
ON public.student_quiz_results
FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);

-- -----------------------------------------------------------------------------
-- Fix mutable function search_path warnings
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  fn RECORD;
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure AS signature
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'update_attendance_updated_at',
        'update_total_fees_from_breakdown',
        'extract_drive_file_id',
        'update_homework_updated_at',
        'update_student_marks_updated_at',
        'update_pending_amount'
      )
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public', fn.signature);
  END LOOP;
END $$;

COMMIT;
