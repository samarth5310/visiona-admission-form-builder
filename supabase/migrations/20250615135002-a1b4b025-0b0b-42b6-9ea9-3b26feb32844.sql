
-- Create table for authorized users
CREATE TABLE public.authorized_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mobile_number TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert the pre-defined authorized users
INSERT INTO public.authorized_users (mobile_number, password, name, role) VALUES
('9353376393', 'Visiona@2025', 'Admin User 1', 'admin'),
('7349420496', 'Visiona@2025', 'Admin User 2', 'admin'),
('8722189292', 'Visiona@2025', 'Admin User 3', 'admin'),
('9742851863', 'Visiona@2025', 'Admin User 4', 'admin');

-- Enable Row Level Security
ALTER TABLE public.authorized_users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow reading authorized users (needed for login verification)
CREATE POLICY "Allow reading authorized users for authentication" 
  ON public.authorized_users 
  FOR SELECT 
  USING (true);
