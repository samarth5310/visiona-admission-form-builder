-- Add residency status for students so admin can mark Residential / Non-Residential.

BEGIN;

ALTER TABLE IF EXISTS public.applications
  ADD COLUMN IF NOT EXISTS residency_type TEXT;

UPDATE public.applications
SET residency_type = COALESCE(residency_type, 'non_residential');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'applications_residency_type_check'
  ) THEN
    ALTER TABLE public.applications
      ADD CONSTRAINT applications_residency_type_check
      CHECK (residency_type IN ('residential', 'non_residential'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_applications_residency_type
  ON public.applications(residency_type);

COMMIT;
