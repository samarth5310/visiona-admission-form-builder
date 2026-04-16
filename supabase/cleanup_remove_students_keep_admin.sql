-- One-time cleanup script: remove all student data and keep admin user(s)
-- Run in Supabase SQL Editor with service role privileges.
-- IMPORTANT: update keep_admin_emails before running.

BEGIN;

-- NOTE:
-- Do NOT delete from storage.objects in SQL. Supabase blocks direct table deletes.
-- To delete uploaded files, first export file paths with this query (run separately),
-- then delete files using Supabase Storage API from app code, an Edge Function, or dashboard UI.
--
-- SELECT file_path
-- FROM public.application_documents
-- WHERE application_id IN (SELECT id FROM public.applications);

DO $$
DECLARE
  keep_admin_emails text[] := ARRAY['ffgzk5310@gmail.com'];
  keep_admin_count int;
BEGIN
  -- Guard: do not proceed if no admin user matches the provided email list.
  SELECT count(*)
  INTO keep_admin_count
  FROM auth.users
  WHERE email = ANY (keep_admin_emails);

  IF keep_admin_count = 0 THEN
    RAISE EXCEPTION 'No admin user found in auth.users for keep_admin_emails. Update keep_admin_emails and retry.';
  END IF;

  -- Optional: keep only admin rows in authorized_users as well.
  DELETE FROM public.authorized_users
  WHERE role <> 'admin';

  -- Remove student-uploaded file records first.
  DELETE FROM public.application_documents
  WHERE application_id IN (SELECT id FROM public.applications);

  -- Remove linked student data.
  DELETE FROM public.fee_payments
  WHERE student_id IN (SELECT id FROM public.applications);

  DELETE FROM public.student_marks
  WHERE student_id IN (SELECT id FROM public.applications);

  DELETE FROM public.student_quiz_results
  WHERE student_id IN (SELECT id FROM public.applications);

  DELETE FROM public.student_fees
  WHERE student_id IN (SELECT id FROM public.applications);

  -- Remove all student applications (core student profile data).
  DELETE FROM public.applications;

  -- Optional: remove broadcast/student-facing messages.
  DELETE FROM public.notifications;

  -- Optional: remove class/homework and quiz content if you want a total student reset.
  -- DELETE FROM public.homework;
  -- DELETE FROM public.exam_content;

  -- Remove non-admin auth users, keep only specified admin emails.
  DELETE FROM auth.users
  WHERE email IS DISTINCT FROM ALL (keep_admin_emails);
END $$;

COMMIT;

-- Verification checks (run separately after COMMIT):
-- SELECT count(*) AS students_left FROM public.applications;
-- SELECT count(*) AS student_fees_left FROM public.student_fees;
-- SELECT count(*) AS fee_payments_left FROM public.fee_payments;
-- SELECT count(*) AS student_marks_left FROM public.student_marks;
-- SELECT count(*) AS student_quiz_results_left FROM public.student_quiz_results;
-- SELECT count(*) AS application_documents_left FROM public.application_documents;
-- SELECT count(*) AS non_admin_auth_users_left FROM auth.users WHERE email <> ALL (ARRAY['ffgzk5310@gmail.com']);
