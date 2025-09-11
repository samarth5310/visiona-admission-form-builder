-- Fix critical security vulnerability in authorized_users table

-- First, drop all existing RLS policies that allow public access
DROP POLICY IF EXISTS "Allow public to view authorized_users" ON authorized_users;
DROP POLICY IF EXISTS "Allow reading authorized users for authentication" ON authorized_users;

-- Create a secure authentication function that uses password hashing
CREATE OR REPLACE FUNCTION public.authenticate_user(
  input_mobile_number TEXT,
  input_password TEXT
)
RETURNS TABLE(
  user_id UUID,
  user_name TEXT,
  mobile_number TEXT,
  user_role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Use crypt() function to hash the input password and compare with stored hash
  RETURN QUERY
  SELECT 
    au.id,
    au.name,
    au.mobile_number,
    au.role
  FROM authorized_users au
  WHERE au.mobile_number = input_mobile_number
    AND au.password = crypt(input_password, au.password)
    AND au.is_active = true;
END;
$$;

-- Hash all existing passwords using crypt() with a salt
-- This will convert plain text passwords to bcrypt hashes
UPDATE authorized_users 
SET password = crypt(password, gen_salt('bf'))
WHERE password NOT LIKE '$%'; -- Only update if not already hashed

-- Create a restrictive RLS policy - no public access to the table
CREATE POLICY "Restrict access to authorized_users"
  ON authorized_users
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Grant execute permission on the authentication function to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.authenticate_user(TEXT, TEXT) TO anon, authenticated;