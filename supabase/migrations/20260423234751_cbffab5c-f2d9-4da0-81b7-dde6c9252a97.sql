ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision;

CREATE INDEX IF NOT EXISTS idx_businesses_lat_lng
  ON public.businesses (latitude, longitude);