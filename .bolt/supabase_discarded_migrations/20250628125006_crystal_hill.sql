/*
  # Create student marks management system

  1. New Tables
    - `student_marks`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key to applications)
      - `subject` (text)
      - `total_marks` (numeric)
      - `marks_obtained` (numeric)
      - `test_name` (text)
      - `test_date` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `student_marks` table
    - Add policies for authenticated users to manage marks
    - Add policies for students to view their own marks

  3. Functions
    - Add trigger function to update `updated_at` timestamp