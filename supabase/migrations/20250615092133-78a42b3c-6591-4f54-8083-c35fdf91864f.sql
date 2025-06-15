
-- Create student_fees table to track fee information for each student
CREATE TABLE public.student_fees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  total_fees DECIMAL(10,2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  pending_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  fee_category TEXT NOT NULL DEFAULT 'tuition', -- tuition, admission, books, etc.
  payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, partial, paid
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create fee_payments table to track payment history
CREATE TABLE public.fee_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_fees_id UUID NOT NULL REFERENCES public.student_fees(id) ON DELETE CASCADE,
  payment_amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT NOT NULL DEFAULT 'cash', -- cash, card, online, cheque
  transaction_id TEXT,
  receipt_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.student_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;

-- Create policies for student_fees (public access for demo purposes)
CREATE POLICY "Anyone can view student fees" ON public.student_fees
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create student fees" ON public.student_fees
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update student fees" ON public.student_fees
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete student fees" ON public.student_fees
  FOR DELETE USING (true);

-- Create policies for fee_payments (public access for demo purposes)
CREATE POLICY "Anyone can view fee payments" ON public.fee_payments
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create fee payments" ON public.fee_payments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update fee payments" ON public.fee_payments
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete fee payments" ON public.fee_payments
  FOR DELETE USING (true);

-- Create function to automatically update pending_amount when payments are made
CREATE OR REPLACE FUNCTION update_pending_amount()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the pending_amount in student_fees table
  UPDATE public.student_fees 
  SET 
    paid_amount = (
      SELECT COALESCE(SUM(payment_amount), 0) 
      FROM public.fee_payments 
      WHERE student_fees_id = NEW.student_fees_id
    ),
    pending_amount = total_fees - (
      SELECT COALESCE(SUM(payment_amount), 0) 
      FROM public.fee_payments 
      WHERE student_fees_id = NEW.student_fees_id
    ),
    payment_status = CASE 
      WHEN total_fees <= (
        SELECT COALESCE(SUM(payment_amount), 0) 
        FROM public.fee_payments 
        WHERE student_fees_id = NEW.student_fees_id
      ) THEN 'paid'
      WHEN (
        SELECT COALESCE(SUM(payment_amount), 0) 
        FROM public.fee_payments 
        WHERE student_fees_id = NEW.student_fees_id
      ) > 0 THEN 'partial'
      ELSE 'pending'
    END,
    updated_at = now()
  WHERE id = NEW.student_fees_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update pending amounts
CREATE TRIGGER update_pending_amount_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.fee_payments
  FOR EACH ROW EXECUTE FUNCTION update_pending_amount();
