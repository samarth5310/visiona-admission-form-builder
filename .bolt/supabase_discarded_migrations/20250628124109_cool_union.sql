/*
  # Fix homework RLS policies

  1. Security Updates
    - Update RLS policies for homework table to allow proper CRUD operations
    - Ensure authenticated users can manage homework assignments
    - Add policies for INSERT, UPDATE, DELETE operations

  2. Changes
    - Drop existing restrictive policies
    - Add comprehensive policies for authenticated users
    - Allow public read access for homework viewing
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage all homework" ON homework;
DROP POLICY IF EXISTS "Students can view homework assigned to their class" ON homework;

-- Create new comprehensive policies
CREATE POLICY "Allow authenticated users to insert homework"
  ON homework
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update homework"
  ON homework
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete homework"
  ON homework
  FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Allow public to view homework"
  ON homework
  FOR SELECT
  TO public
  USING (true);

-- Also ensure anon users can view homework (for student access)
CREATE POLICY "Allow anonymous users to view homework"
  ON homework
  FOR SELECT
  TO anon
  USING (true);