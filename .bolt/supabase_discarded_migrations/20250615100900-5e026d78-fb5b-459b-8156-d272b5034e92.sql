
-- Add unique constraint on application_id to allow upsert operations
ALTER TABLE public.student_fees ADD CONSTRAINT student_fees_application_id_unique UNIQUE (application_id);
