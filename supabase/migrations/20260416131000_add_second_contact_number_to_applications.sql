-- Add optional second mobile number for students.

BEGIN;

ALTER TABLE IF EXISTS public.applications
  ADD COLUMN IF NOT EXISTS second_contact_number TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'applications_second_contact_number_check'
  ) THEN
    ALTER TABLE public.applications
      ADD CONSTRAINT applications_second_contact_number_check
      CHECK (second_contact_number IS NULL OR second_contact_number ~ '^[0-9]{10}$');
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_applications_second_contact_number
  ON public.applications(second_contact_number);

COMMIT;
