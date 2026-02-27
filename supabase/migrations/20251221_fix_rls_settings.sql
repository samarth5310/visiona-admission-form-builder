-- Create a security definer function to check if the current user is an admin
-- This is necessary because the authorized_users table itself is locked down by RLS
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM authorized_users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Drop the old policy
DROP POLICY IF EXISTS "Allow admin to manage institution_settings" ON public.institution_settings;

-- Create the new policy using the security definer function
CREATE POLICY "Allow admin to manage institution_settings"
ON public.institution_settings FOR ALL
TO authenticated
USING (check_is_admin())
WITH CHECK (check_is_admin());

-- Also ensure public read access is still there just in case it was dropped
DROP POLICY IF EXISTS "Allow public read access to institution_settings" ON public.institution_settings;
CREATE POLICY "Allow public read access to institution_settings"
ON public.institution_settings FOR SELECT
USING (true);
