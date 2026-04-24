-- Ensure table exists with the right shape
CREATE TABLE IF NOT EXISTS public.business_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  owner_name TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  owner_phone TEXT NOT NULL,
  owner_message TEXT,
  proposed_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Backfill any missing columns in case an older shape exists
ALTER TABLE public.business_claims
  ADD COLUMN IF NOT EXISTS owner_name TEXT,
  ADD COLUMN IF NOT EXISTS owner_email TEXT,
  ADD COLUMN IF NOT EXISTS owner_phone TEXT,
  ADD COLUMN IF NOT EXISTS owner_message TEXT,
  ADD COLUMN IF NOT EXISTS proposed_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS admin_notes TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_business_claims_business_id ON public.business_claims(business_id);
CREATE INDEX IF NOT EXISTS idx_business_claims_status ON public.business_claims(status);

-- Flags on businesses
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS is_claimed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP WITH TIME ZONE;

-- updated_at trigger (re-create safely)
DROP TRIGGER IF EXISTS update_business_claims_updated_at ON public.business_claims;
CREATE TRIGGER update_business_claims_updated_at
BEFORE UPDATE ON public.business_claims
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.business_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit a claim" ON public.business_claims;
DROP POLICY IF EXISTS "Anyone can view claims" ON public.business_claims;
DROP POLICY IF EXISTS "Anyone can update claims" ON public.business_claims;
DROP POLICY IF EXISTS "Anyone can delete claims" ON public.business_claims;

CREATE POLICY "Anyone can submit a claim"
  ON public.business_claims FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can view claims"
  ON public.business_claims FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can update claims"
  ON public.business_claims FOR UPDATE TO public USING (true);
CREATE POLICY "Anyone can delete claims"
  ON public.business_claims FOR DELETE TO public USING (true);