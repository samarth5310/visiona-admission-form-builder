
-- Create student_fees table to track fee information for each student
CREATE TABLE IF NOT EXISTS public.student_fees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    total_fees DECIMAL(10,2) DEFAULT 0,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    pending_amount DECIMAL(10,2) DEFAULT 0,
    payment_status TEXT DEFAULT 'not_set' CHECK (payment_status IN ('not_set', 'pending', 'partial', 'paid')),
    fee_category TEXT DEFAULT 'tuition',
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create fee_payments table to track individual payments
CREATE TABLE IF NOT EXISTS public.fee_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_fees_id UUID NOT NULL REFERENCES public.student_fees(id) ON DELETE CASCADE,
    payment_amount DECIMAL(10,2) NOT NULL,
    payment_date DATE DEFAULT CURRENT_DATE,
    payment_method TEXT DEFAULT 'cash',
    transaction_id TEXT,
    receipt_number TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on both tables
ALTER TABLE public.student_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies to allow public access (since this is an admin system)
CREATE POLICY "Allow all operations on student_fees" ON public.student_fees FOR ALL USING (true);
CREATE POLICY "Allow all operations on fee_payments" ON public.fee_payments FOR ALL USING (true);

-- Create function to automatically update pending_amount when payments are made
CREATE OR REPLACE FUNCTION update_pending_amount()
RETURNS TRIGGER AS $$
BEGIN
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
        updated_at = NOW()
    WHERE id = NEW.student_fees_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update pending amounts
CREATE TRIGGER trigger_update_pending_amount
    AFTER INSERT OR UPDATE OR DELETE ON public.fee_payments
    FOR EACH ROW EXECUTE FUNCTION update_pending_amount();
