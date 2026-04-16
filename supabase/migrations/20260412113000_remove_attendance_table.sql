-- Remove unused attendance system from database.
-- Safe/idempotent cleanup for table and related policies/triggers/functions.

BEGIN;

DROP POLICY IF EXISTS "Public can read attendance" ON public.attendance;
DROP POLICY IF EXISTS "Authenticated can insert attendance" ON public.attendance;
DROP POLICY IF EXISTS "Authenticated can update attendance" ON public.attendance;
DROP POLICY IF EXISTS "Authenticated can delete attendance" ON public.attendance;
DROP POLICY IF EXISTS "Allow public to create attendance" ON public.attendance;
DROP POLICY IF EXISTS "Allow public to update attendance" ON public.attendance;
DROP POLICY IF EXISTS "Allow public to delete attendance" ON public.attendance;

DROP TRIGGER IF EXISTS update_attendance_updated_at ON public.attendance;
DROP TRIGGER IF EXISTS update_attendance_updated_at_trigger ON public.attendance;
DROP FUNCTION IF EXISTS public.update_attendance_updated_at();

DROP TABLE IF EXISTS public.attendance;

COMMIT;
