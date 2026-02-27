-- Create institution_settings table
CREATE TABLE IF NOT EXISTS public.institution_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    upi_id TEXT NOT NULL,
    merchant_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for institution_settings
ALTER TABLE public.institution_settings ENABLE ROW LEVEL SECURITY;

-- Allow public to view settings (needed for student payment)
CREATE POLICY "Allow public read access to institution_settings"
ON public.institution_settings FOR SELECT
USING (true);

-- Allow admin only to manage settings
-- Assuming 'admin' role exists in authorized_users based on earlier analysis
CREATE POLICY "Allow admin to manage institution_settings"
ON public.institution_settings FOR ALL
USING (EXISTS (
    SELECT 1 FROM authorized_users 
    WHERE id = auth.uid() AND role = 'admin'
));

-- Add fee_breakdown to student_fees
-- JSONB structure: [{ "name": "Tuition", "amount": 5000 }, { "name": "Books", "amount": 2000 }]
ALTER TABLE public.student_fees 
ADD COLUMN IF NOT EXISTS fee_breakdown JSONB DEFAULT '[]'::jsonb;

-- Trigger for auto-updating total_fees based on breakdown (Optional but helpful)
CREATE OR REPLACE FUNCTION update_total_fees_from_breakdown()
RETURNS TRIGGER AS $$
DECLARE
    item JSONB;
    total NUMERIC := 0;
BEGIN
    IF NEW.fee_breakdown IS NOT NULL AND jsonb_array_length(NEW.fee_breakdown) > 0 THEN
        FOR item IN SELECT * FROM jsonb_array_elements(NEW.fee_breakdown) LOOP
            total := total + (item->>'amount')::NUMERIC;
        END LOOP;
        NEW.total_fees := total;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_total_fees
BEFORE INSERT OR UPDATE OF fee_breakdown ON public.student_fees
FOR EACH ROW
EXECUTE FUNCTION update_total_fees_from_breakdown();
