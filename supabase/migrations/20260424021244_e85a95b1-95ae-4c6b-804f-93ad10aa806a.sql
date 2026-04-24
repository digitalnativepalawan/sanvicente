
-- 1) Extend businesses with menu_images + room_types
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS menu_images jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS room_types jsonb NOT NULL DEFAULT '[]'::jsonb;

-- 2) Create business_submissions table (mirrors claim flow but for new listings)
CREATE TABLE IF NOT EXISTS public.business_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_name text NOT NULL,
  owner_email text NOT NULL,
  owner_phone text NOT NULL,
  owner_message text,
  proposed_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text DEFAULT 'pending',
  admin_notes text,
  reviewed_at timestamp without time zone,
  approved_business_id uuid REFERENCES public.businesses(id) ON DELETE SET NULL,
  created_at timestamp without time zone DEFAULT now()
);

ALTER TABLE public.business_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit a listing" ON public.business_submissions;
CREATE POLICY "Anyone can submit a listing" ON public.business_submissions FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can view submissions" ON public.business_submissions;
CREATE POLICY "Anyone can view submissions" ON public.business_submissions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can update submissions" ON public.business_submissions;
CREATE POLICY "Anyone can update submissions" ON public.business_submissions FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Anyone can delete submissions" ON public.business_submissions;
CREATE POLICY "Anyone can delete submissions" ON public.business_submissions FOR DELETE USING (true);

-- 3) Create public storage bucket for owner/admin uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-uploads', 'business-uploads', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 4) Storage policies (public read, public write — matches existing access model)
DROP POLICY IF EXISTS "Public can read business uploads" ON storage.objects;
CREATE POLICY "Public can read business uploads" ON storage.objects
  FOR SELECT USING (bucket_id = 'business-uploads');

DROP POLICY IF EXISTS "Public can upload business uploads" ON storage.objects;
CREATE POLICY "Public can upload business uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'business-uploads');

DROP POLICY IF EXISTS "Public can update business uploads" ON storage.objects;
CREATE POLICY "Public can update business uploads" ON storage.objects
  FOR UPDATE USING (bucket_id = 'business-uploads');

DROP POLICY IF EXISTS "Public can delete business uploads" ON storage.objects;
CREATE POLICY "Public can delete business uploads" ON storage.objects
  FOR DELETE USING (bucket_id = 'business-uploads');
