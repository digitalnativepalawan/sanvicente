-- Businesses table
CREATE TABLE public.businesses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  subcategory TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  facebook TEXT,
  instagram TEXT,
  address TEXT NOT NULL DEFAULT '',
  barangay TEXT NOT NULL DEFAULT '',
  google_maps_link TEXT,
  description TEXT NOT NULL DEFAULT '',
  short_description TEXT NOT NULL DEFAULT '',
  services JSONB NOT NULL DEFAULT '[]'::jsonb,
  amenities JSONB NOT NULL DEFAULT '[]'::jsonb,
  image TEXT NOT NULL DEFAULT '',
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  price_range TEXT NOT NULL DEFAULT '₱',
  opening_hours JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  rating NUMERIC NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  listing_tier TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_businesses_category ON public.businesses(category);
CREATE INDEX idx_businesses_barangay ON public.businesses(barangay);
CREATE INDEX idx_businesses_active ON public.businesses(is_active);
CREATE INDEX idx_businesses_featured ON public.businesses(is_featured);

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Public read for active businesses
CREATE POLICY "Anyone can view active businesses"
ON public.businesses FOR SELECT
USING (is_active = true OR true);

-- Open write for now (passcode-protected admin UI). Will be locked to admin role later.
CREATE POLICY "Anyone can insert businesses"
ON public.businesses FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update businesses"
ON public.businesses FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete businesses"
ON public.businesses FOR DELETE
USING (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_businesses_updated_at
BEFORE UPDATE ON public.businesses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();