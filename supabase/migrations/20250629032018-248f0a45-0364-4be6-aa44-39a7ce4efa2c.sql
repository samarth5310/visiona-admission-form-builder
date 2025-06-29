
-- Fix homework table RLS policies
DROP POLICY IF EXISTS "Allow authenticated users to insert homework" ON homework;
DROP POLICY IF EXISTS "Allow authenticated users to update homework" ON homework;
DROP POLICY IF EXISTS "Allow authenticated users to delete homework" ON homework;
DROP POLICY IF EXISTS "Allow public to view homework" ON homework;
DROP POLICY IF EXISTS "Allow anonymous users to view homework" ON homework;
DROP POLICY IF EXISTS "Allow public to create homework" ON homework;
DROP POLICY IF EXISTS "Allow public to update homework" ON homework;
DROP POLICY IF EXISTS "Allow public to delete homework" ON homework;

-- Create proper RLS policies for homework
CREATE POLICY "Allow public to view homework"
  ON homework
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public to create homework"
  ON homework
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public to update homework"
  ON homework
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public to delete homework"
  ON homework
  FOR DELETE
  TO public
  USING (true);

-- Fix student_marks table RLS policies
DROP POLICY IF EXISTS "Students can view their own marks" ON student_marks;
DROP POLICY IF EXISTS "Admins can manage all marks" ON student_marks;

-- Create proper RLS policies for student_marks
CREATE POLICY "Allow public to view marks"
  ON student_marks
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public to create marks"
  ON student_marks
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public to update marks"
  ON student_marks
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public to delete marks"
  ON student_marks
  FOR DELETE
  TO public
  USING (true);

-- Fix applications table RLS policies (if any exist)
DROP POLICY IF EXISTS "Allow authenticated users to view applications" ON applications;
DROP POLICY IF EXISTS "Allow authenticated users to manage applications" ON applications;

-- Create proper RLS policies for applications
CREATE POLICY "Allow public to view applications"
  ON applications
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public to create applications"
  ON applications
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public to update applications"
  ON applications
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Fix student_fees table RLS policies
DROP POLICY IF EXISTS "Allow authenticated users to view fees" ON student_fees;
DROP POLICY IF EXISTS "Allow authenticated users to manage fees" ON student_fees;

-- Create proper RLS policies for student_fees
CREATE POLICY "Allow public to view student_fees"
  ON student_fees
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public to manage student_fees"
  ON student_fees
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Fix fee_payments table RLS policies
DROP POLICY IF EXISTS "Allow authenticated users to view payments" ON fee_payments;
DROP POLICY IF EXISTS "Allow authenticated users to manage payments" ON fee_payments;

-- Create proper RLS policies for fee_payments
CREATE POLICY "Allow public to view fee_payments"
  ON fee_payments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public to manage fee_payments"
  ON fee_payments
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Fix authorized_users table RLS policies
DROP POLICY IF EXISTS "Allow authenticated users to view authorized_users" ON authorized_users;

-- Create proper RLS policies for authorized_users
CREATE POLICY "Allow public to view authorized_users"
  ON authorized_users
  FOR SELECT
  TO public
  USING (true);
