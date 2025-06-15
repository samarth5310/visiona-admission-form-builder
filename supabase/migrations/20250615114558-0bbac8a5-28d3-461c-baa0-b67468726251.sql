
-- Remove the due_date column from student_fees table
ALTER TABLE public.student_fees DROP COLUMN IF EXISTS due_date;

-- Add paid_date column to student_fees table
ALTER TABLE public.student_fees ADD COLUMN paid_date DATE;

-- Update the trigger function to handle the new paid_date logic
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
        paid_date = CASE 
            WHEN total_fees <= (
                SELECT COALESCE(SUM(payment_amount), 0) 
                FROM public.fee_payments 
                WHERE student_fees_id = NEW.student_fees_id
            ) THEN CURRENT_DATE
            ELSE paid_date
        END,
        updated_at = NOW()
    WHERE id = NEW.student_fees_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
