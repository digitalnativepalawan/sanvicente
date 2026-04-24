import { createContext, ReactNode, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type LinkItem = { label: string; url: string };

export type SiteSettings = {
  id: string;
  logo_url: string;
  logo_size_header: number;
  logo_size_footer: number;
  logo_size_hero: number;
  site_name: string;
  site_tagline: string;
  footer_tagline: string;
  copyright_text: string;
  contact_email: string;
  contact_phone: string;
  facebook_url: string;
  instagram_url: string;
  tiktok_url: string;
  youtube_url: string;
  x_url: string;
  website_url: string;
  footer_links: LinkItem[];
  partner_links: LinkItem[];
};

const DEFAULTS: SiteSettings = {
  id: "",
  logo_url: "https://hqsbyagdsgfwjvkxmyzm.supabase.co/storage/v1/object/public/logo-sanvic/Untitled%20design.png",
  logo_size_header: 48,
  logo_size_footer: 56,
  logo_size_hero: 96,
  site_name: "San Vicente Directory",
  site_tagline: "Discover San Vicente, slowly.",
  footer_tagline: "A locally curated directory of resorts, restaurants, tours, and hidden gems along Palawan's legendary 14-km Long Beach.",
  copyright_text: "© San Vicente Directory. All rights reserved.",
  contact_email: "",
  contact_phone: "",
  facebook_url: "",
  instagram_url: "",
  tiktok_url: "",
  youtube_url: "",
  x_url: "",
  website_url: "",
  footer_links: [],
  partner_links: [],
};

type Ctx = {
  settings: SiteSettings;
  loading: boolean;
  reload: () => Promise<void>;
  save: (patch: Partial<SiteSettings>) => Promise<void>;
};

const SiteSettingsContext = createContext<Ctx | undefined>(undefined);

const normalize = (row: Record<string, unknown>): SiteSettings => ({
  ...DEFAULTS,
  ...row,
  footer_links: Array.isArray(row?.footer_links) ? (row.footer_links as LinkItem[]) : [],
  partner_links: Array.isArray(row?.partner_links) ? (row.partner_links as LinkItem[]) : [],
} as SiteSettings);

export const SiteSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (!error && data) setSettings(normalize(data as unknown as Record<string, unknown>));
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const save = useCallback(async (patch: Partial<SiteSettings>) => {
    if (!settings.id) {
      const { data, error } = await supabase
        .from("site_settings")
        .insert({ ...DEFAULTS, ...patch, footer_links: patch.footer_links ?? [], partner_links: patch.partner_links ?? [] })
        .select("*")
        .maybeSingle();
      if (error) throw error;
      if (data) setSettings(normalize(data as unknown as Record<string, unknown>));
      return;
    }
    const { data, error } = await supabase
      .from("site_settings")
      .update(patch)
      .eq("id", settings.id)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    if (data) setSettings(normalize(data as unknown as Record<string, unknown>));
  }, [settings.id]);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, reload, save }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) throw new Error("useSiteSettings must be used within SiteSettingsProvider");
  return ctx;
};
