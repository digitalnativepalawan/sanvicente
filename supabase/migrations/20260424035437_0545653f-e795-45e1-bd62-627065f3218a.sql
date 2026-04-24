
CREATE TABLE public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  singleton boolean NOT NULL DEFAULT true UNIQUE,
  logo_url text NOT NULL DEFAULT 'https://hqsbyagdsgfwjvkxmyzm.supabase.co/storage/v1/object/public/logo-sanvic/Untitled%20design.png',
  logo_size_header integer NOT NULL DEFAULT 48,
  logo_size_footer integer NOT NULL DEFAULT 56,
  logo_size_hero integer NOT NULL DEFAULT 96,
  site_name text NOT NULL DEFAULT 'San Vicente Directory',
  site_tagline text NOT NULL DEFAULT 'Discover San Vicente, slowly.',
  footer_tagline text NOT NULL DEFAULT 'A locally curated directory of resorts, restaurants, tours, and hidden gems along Palawan''s legendary 14-km Long Beach.',
  copyright_text text NOT NULL DEFAULT '© San Vicente Directory. All rights reserved.',
  contact_email text DEFAULT '',
  contact_phone text DEFAULT '',
  facebook_url text DEFAULT '',
  instagram_url text DEFAULT '',
  tiktok_url text DEFAULT '',
  youtube_url text DEFAULT '',
  x_url text DEFAULT '',
  website_url text DEFAULT '',
  footer_links jsonb NOT NULL DEFAULT '[]'::jsonb,
  partner_links jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site settings"
  ON public.site_settings FOR SELECT USING (true);

CREATE POLICY "Anyone can insert site settings"
  ON public.site_settings FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update site settings"
  ON public.site_settings FOR UPDATE USING (true);

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.site_settings (singleton) VALUES (true);
