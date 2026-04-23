import { useCallback, useEffect, useState } from "react";
import type { Business } from "@/types/business";
import { BUSINESSES as SEED } from "@/data/businesses";

const KEY = "sv-businesses";
const ANALYTICS_KEY = "sv-analytics";

type AnalyticsMap = Record<string, { views: number; clicks: number }>;

let memoryStore: Business[] | null = null;
const listeners = new Set<() => void>();

const load = (): Business[] => {
  if (memoryStore) return memoryStore;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      memoryStore = JSON.parse(raw) as Business[];
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
    return biz;
  },
  update: (id: string, patch: Partial<Business>) => {
    const list = load();
    memoryStore = list.map((b) => (b.id === id ? { ...b, ...patch } : b));
    persist();
    return memoryStore.find((b) => b.id === id);
  },
  remove: (id: string) => {
    memoryStore = load().filter((b) => b.id !== id);
    persist();
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
    return () => { unsub; };
  }, []);
  return items;
};

export const useBusiness = (id?: string) => {
  const all = useBusinesses();
  return all.find((b) => b.id === id);
};

export const useBusinessBySlug = (slug?: string) => {
  const all = useBusinesses();
  return useCallback(() => all.find((b) => b.slug === slug), [all, slug])();
};

export { slugify };
