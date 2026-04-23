import { useEffect, useState } from "react";
import type { Business } from "@/types/business";
import { BUSINESSES as SEED } from "@/data/businesses";
import { supabase } from "@/integrations/supabase/client";

const KEY = "sv-businesses";
const ANALYTICS_KEY = "sv-analytics";
const CLOUD_FLAG_KEY = "sv-use-cloud";

type AnalyticsMap = Record<string, { views: number; clicks: number }>;

let memoryStore: Business[] | null = null;
let cloudReady = false;
const listeners = new Set<() => void>();

export const isCloudEnabled = () => {
  try { return localStorage.getItem(CLOUD_FLAG_KEY) === "1"; } catch { return false; }
};
export const setCloudEnabled = (on: boolean) => {
  try { localStorage.setItem(CLOUD_FLAG_KEY, on ? "1" : "0"); } catch { /* ignore */ }
};

const SEED_IDS = new Set(Array.from({ length: 15 }, (_, i) => String(i + 1)));
const SEED_CLEAN_FLAG = "sv-seed-cleaned-v1";

const stripSeed = (list: Business[]): Business[] =>
  list.filter((b) => !SEED_IDS.has(b.id));

const load = (): Business[] => {
  if (memoryStore) return memoryStore;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      let parsed = JSON.parse(raw) as Business[];
      if (localStorage.getItem(SEED_CLEAN_FLAG) !== "1") {
        const before = parsed.length;
        parsed = stripSeed(parsed);
        if (parsed.length !== before) {
          localStorage.setItem(KEY, JSON.stringify(parsed));
        }
        localStorage.setItem(SEED_CLEAN_FLAG, "1");
      }
      memoryStore = parsed;
      return memoryStore;
    }
  } catch { /* ignore */ }
  memoryStore = [...SEED];
  localStorage.setItem(KEY, JSON.stringify(memoryStore));
  return memoryStore;
};

const persist = () => {
  if (!memoryStore) return;
  localStorage.setItem(KEY, JSON.stringify(memoryStore));
  listeners.forEach((l) => l());
};

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// ---------- Mapping between DB row and Business type ----------
const rowToBusiness = (r: any): Business => ({
  id: r.id,
  name: r.name,
  slug: r.slug,
  category: r.category,
  subcategory: r.subcategory ?? undefined,
  phone: r.phone ?? undefined,
  email: r.email ?? undefined,
  website: r.website ?? undefined,
  facebook: r.facebook ?? undefined,
  instagram: r.instagram ?? undefined,
  address: r.address ?? "",
  barangay: r.barangay ?? "",
  googleMapsLink: r.google_maps_link ?? undefined,
  description: r.description ?? "",
  shortDescription: r.short_description ?? "",
  services: r.services ?? [],
  amenities: r.amenities ?? [],
  image: r.image ?? "",
  images: r.images ?? [],
  priceRange: (r.price_range ?? "₱") as Business["priceRange"],
  openingHours: r.opening_hours ?? {},
  isFeatured: !!r.is_featured,
  isVerified: !!r.is_verified,
  isActive: r.is_active !== false,
  rating: Number(r.rating ?? 0),
  reviewCount: r.review_count ?? 0,
  viewCount: r.view_count ?? 0,
  listingTier: (r.listing_tier ?? "free") as Business["listingTier"],
  latitude: r.latitude == null ? undefined : Number(r.latitude),
  longitude: r.longitude == null ? undefined : Number(r.longitude),
  createdAt: (r.created_at ?? new Date().toISOString()).slice(0, 10),
});

const businessToRow = (b: Business) => ({
  id: b.id,
  name: b.name,
  slug: b.slug,
  category: b.category,
  subcategory: b.subcategory ?? null,
  phone: b.phone ?? null,
  email: b.email ?? null,
  website: b.website ?? null,
  facebook: b.facebook ?? null,
  instagram: b.instagram ?? null,
  address: b.address ?? "",
  barangay: b.barangay ?? "",
  google_maps_link: b.googleMapsLink ?? null,
  description: b.description ?? "",
  short_description: b.shortDescription ?? "",
  services: b.services ?? [],
  amenities: b.amenities ?? [],
  image: b.image ?? "",
  images: b.images ?? [],
  price_range: b.priceRange ?? "₱",
  opening_hours: b.openingHours ?? {},
  is_featured: !!b.isFeatured,
  is_verified: !!b.isVerified,
  is_active: b.isActive !== false,
  rating: b.rating ?? 0,
  review_count: b.reviewCount ?? 0,
  view_count: b.viewCount ?? 0,
  listing_tier: b.listingTier ?? "free",
  latitude: b.latitude ?? null,
  longitude: b.longitude ?? null,
});

// ---------- Cloud hydration ----------
export const hydrateFromCloud = async () => {
  if (!isCloudEnabled()) return;
  try {
    const { data, error } = await supabase
      .from("businesses" as any)
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    if (data) {
      memoryStore = (data as any[]).map(rowToBusiness);
      cloudReady = true;
      persist();
    }
  } catch (e) {
    console.error("Cloud hydration failed, using local cache", e);
  }
};

// Fire and forget on module load
if (typeof window !== "undefined" && isCloudEnabled()) {
  hydrateFromCloud();
}

// ---------- Cloud writers (fire and forget) ----------
const cloudUpsert = (b: Business) => {
  if (!isCloudEnabled()) return;
  supabase.from("businesses" as any).upsert(businessToRow(b)).then(({ error }) => {
    if (error) console.error("Cloud upsert failed", error);
  });
};
const cloudDelete = (id: string) => {
  if (!isCloudEnabled()) return;
  supabase.from("businesses" as any).delete().eq("id", id).then(({ error }) => {
    if (error) console.error("Cloud delete failed", error);
  });
};

export const businessStore = {
  list: () => load(),
  get: (id: string) => load().find((b) => b.id === id),
  getBySlug: (slug: string) => load().find((b) => b.slug === slug),
  create: (data: Omit<Business, "id" | "slug" | "createdAt" | "viewCount" | "rating" | "reviewCount"> & { slug?: string }) => {
    const list = load();
    const id = crypto.randomUUID();
    const slug = data.slug?.trim() || slugify(data.name);
    const biz: Business = {
      ...data,
      id,
      slug,
      rating: 0,
      reviewCount: 0,
      viewCount: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    } as Business;
    memoryStore = [biz, ...list];
    persist();
    cloudUpsert(biz);
    return biz;
  },
  update: (id: string, patch: Partial<Business>) => {
    const list = load();
    memoryStore = list.map((b) => (b.id === id ? { ...b, ...patch } : b));
    persist();
    const updated = memoryStore.find((b) => b.id === id);
    if (updated) cloudUpsert(updated);
    return updated;
  },
  remove: (id: string) => {
    memoryStore = load().filter((b) => b.id !== id);
    persist();
    cloudDelete(id);
  },
  toggleFeatured: (id: string) => {
    const b = load().find((x) => x.id === id);
    if (!b) return;
    businessStore.update(id, { isFeatured: !b.isFeatured, listingTier: !b.isFeatured ? "featured" : "free" });
  },
  toggleVerified: (id: string) => {
    const b = load().find((x) => x.id === id);
    if (!b) return;
    businessStore.update(id, { isVerified: !b.isVerified });
  },
  toggleActive: (id: string) => {
    const b = load().find((x) => x.id === id);
    if (!b) return;
    businessStore.update(id, { isActive: !b.isActive });
  },
  reset: () => {
    memoryStore = [...SEED];
    persist();
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  // ---- Migration helpers ----
  countLocal: () => load().length,
  migrateAllToCloud: async (
    onProgress?: (done: number, total: number) => void
  ): Promise<{ uploaded: number; failed: number; errors: string[] }> => {
    const list = load();
    const total = list.length;
    let uploaded = 0;
    let failed = 0;
    const errors: string[] = [];

    // Pre-fetch existing slugs from cloud to avoid unique-constraint collisions
    const existingSlugs = new Set<string>();
    try {
      const { data: existing } = await supabase
        .from("businesses" as any)
        .select("slug");
      (existing as any[] | null)?.forEach((r) => r?.slug && existingSlugs.add(r.slug));
    } catch { /* ignore — will surface per-row */ }

    // Ensure unique slugs across the batch + existing cloud rows
    const seen = new Set<string>(existingSlugs);
    const deduped = list.map((b) => {
      const base = (b.slug && b.slug.trim()) || slugify(b.name) || "business";
      let candidate = base;
      let n = 2;
      while (seen.has(candidate)) {
        candidate = `${base}-${n}`;
        n++;
      }
      seen.add(candidate);
      if (candidate !== b.slug) {
        // Persist locally too so app stays in sync
        memoryStore = (memoryStore ?? list).map((x) => (x.id === b.id ? { ...x, slug: candidate } : x));
        return { ...b, slug: candidate };
      }
      return b;
    });
    persist();

    const CHUNK = 50;
    for (let i = 0; i < deduped.length; i += CHUNK) {
      const chunk = deduped.slice(i, i + CHUNK).map(businessToRow);
      const { error } = await supabase
        .from("businesses" as any)
        .upsert(chunk, { onConflict: "id" });
      if (error) {
        failed += chunk.length;
        errors.push(error.message);
      } else {
        uploaded += chunk.length;
      }
      onProgress?.(Math.min(i + CHUNK, total), total);
    }
    if (uploaded > 0 && failed === 0) {
      setCloudEnabled(true);
      cloudReady = true;
    }
    return { uploaded, failed, errors };
  },
  isCloudReady: () => cloudReady,
};

// Analytics
const loadAnalytics = (): AnalyticsMap => {
  try {
    const raw = localStorage.getItem(ANALYTICS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
};

export const analytics = {
  trackView: (id: string) => {
    const map = loadAnalytics();
    map[id] = { views: (map[id]?.views ?? 0) + 1, clicks: map[id]?.clicks ?? 0 };
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(map));
    businessStore.update(id, { viewCount: (businessStore.get(id)?.viewCount ?? 0) + 1 });
  },
  trackClick: (id: string) => {
    const map = loadAnalytics();
    map[id] = { views: map[id]?.views ?? 0, clicks: (map[id]?.clicks ?? 0) + 1 };
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(map));
  },
  all: () => loadAnalytics(),
  totals: () => {
    const map = loadAnalytics();
    let views = 0, clicks = 0;
    Object.values(map).forEach((v) => { views += v.views; clicks += v.clicks; });
    return { views, clicks };
  },
};

export const useBusinesses = () => {
  const [items, setItems] = useState<Business[]>(() => load());
  useEffect(() => {
    const unsub = businessStore.subscribe(() => setItems([...load()]));
    return () => { unsub(); };
  }, []);
  return items;
};

export const useBusiness = (id?: string) => {
  const all = useBusinesses();
  return all.find((b) => b.id === id);
};

export const useBusinessBySlug = (slug?: string) => {
  const all = useBusinesses();
  return all.find((b) => b.slug === slug);
};

export { slugify };
