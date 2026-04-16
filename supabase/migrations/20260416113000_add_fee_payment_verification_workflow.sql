-- Add payment verification workflow fields for manual office confirmation.

BEGIN;

ALTER TABLE IF EXISTS public.fee_payments
  ADD COLUMN IF NOT EXISTS verification_status TEXT;

ALTER TABLE IF EXISTS public.fee_payments
  ADD COLUMN IF NOT EXISTS submitted_utr TEXT;

ALTER TABLE IF EXISTS public.fee_payments
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

ALTER TABLE IF EXISTS public.fee_payments
  ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.fee_payments
  ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- Backfill existing records as verified so current data remains valid.
UPDATE public.fee_payments
SET verification_status = COALESCE(verification_status, 'verified');

-- Enforce allowed statuses.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fee_payments_verification_status_check'
  ) THEN
    ALTER TABLE public.fee_payments
      ADD CONSTRAINT fee_payments_verification_status_check
      CHECK (verification_status IN ('pending_verification', 'verified', 'rejected'));
  END IF;
END $$;

ALTER TABLE public.fee_payments
  ALTER COLUMN verification_status SET DEFAULT 'verified';

ALTER TABLE public.fee_payments
  ALTER COLUMN verification_status SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_fee_payments_student_fees_verification
  ON public.fee_payments(student_fees_id, verification_status);

COMMIT;
