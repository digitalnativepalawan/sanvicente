import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2 } from "lucide-react";
import type { Business } from "@/types/business";
import { CATEGORIES } from "@/data/categories";
import { useHoverStore } from "@/hooks/use-hover-store";
import { getBusinessImage } from "@/lib/business-image";

interface Props {
  businesses: Business[];
}

const CENTER: L.LatLngExpression = [10.5356, 119.2333];

const FILTERS: Array<{ slug: "all" | string; label: string }> = [
  { slug: "all", label: "All" },
  ...CATEGORIES.filter((c) => c.slug !== "services").map((c) => ({ slug: c.slug, label: c.label })),
];

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const glowMarkerIcon = (active = false) =>
  L.divIcon({
    className: "explore-pin",
    html: `<div class="explore-glow-marker${active ? " is-active" : ""}"><span class="core"></span></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });

export const ExploreCoast = ({ businesses }: Props) => {
  const navigate = useNavigate();
  const elRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const filter = useHoverStore((s) => s.categoryFilter);
  const setFilter = useHoverStore((s) => s.setCategoryFilter);
  const hoveredId = useHoverStore((s) => s.hoveredId);
  const [ready, setReady] = useState(false);
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    if (!elRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldMount(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(elRef.current);
    return () => observer.disconnect();
  }, []);

  const mapped = useMemo(
    () =>
      businesses.filter(
        (b) =>
          b.isActive &&
          typeof b.latitude === "number" &&
          typeof b.longitude === "number" &&
          Number.isFinite(b.latitude) &&
          Number.isFinite(b.longitude),
      ),
    [businesses],
  );

  const unmapped = businesses.filter((b) => b.isActive).length - mapped.length;

  const visible = useMemo(
    () => (filter === "all" ? mapped : mapped.filter((b) => b.category === filter)),
    [mapped, filter],
  );

  // Init map
  useEffect(() => {
    if (!shouldMount || !elRef.current || mapRef.current) return;
    const map = L.map(elRef.current, {
      center: CENTER,
      zoom: 12,
      zoomControl: true,
      scrollWheelZoom: false,
    });
    mapRef.current = map;

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      subdomains: "abcd",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(map);

    layerRef.current = L.layerGroup().addTo(map);
    setReady(true);

    return () => {
      layerRef.current?.clearLayers();
      layerRef.current = null;
      markersRef.current.clear();
      map.remove();
      mapRef.current = null;
    };
  }, [shouldMount]);

  // Render pins
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer || !ready) return;
    layer.clearLayers();
    markersRef.current.clear();

    if (visible.length === 0) {
      map.setView(CENTER, 12);
      return;
    }

    const bounds = L.latLngBounds([]);
    visible.forEach((b) => {
      const m = L.marker([b.latitude!, b.longitude!], { icon: glowMarkerIcon() });
      const thumb = getBusinessImage(b);
      const popup = `
        <div style="min-width:220px">
          <img src="${escapeHtml(thumb)}" alt="" style="width:100%;height:110px;object-fit:cover;border-radius:8px;margin-bottom:8px"/>
          <p style="margin:0 0 4px 0;font-weight:600;font-size:14px;color:#0f172a">${escapeHtml(b.name)}</p>
          <p style="margin:0 0 8px 0;font-size:11px;color:#64748b">${escapeHtml(CATEGORIES.find((c) => c.slug === b.category)?.label ?? b.category)}${b.rating > 0 ? ` · ★ ${b.rating.toFixed(1)}` : ""}</p>
          <button type="button" data-slug="${escapeHtml(b.slug)}" class="explore-popup-btn" style="display:inline-flex;align-items:center;justify-content:center;width:100%;height:32px;border-radius:6px;background:#10B981;color:#fff;border:0;font-size:12px;font-weight:600;cursor:pointer">View Details</button>
        </div>`;
      m.bindPopup(popup);
      m.on("popupopen", (e) => {
        const node = (e.popup.getElement() as HTMLElement | null)?.querySelector<HTMLButtonElement>(
          ".explore-popup-btn",
        );
        if (!node) return;
        node.onclick = () => {
          const slug = node.getAttribute("data-slug");
          if (slug) navigate(`/business/${slug}`);
        };
      });
      m.addTo(layer);
      markersRef.current.set(b.id, m);
      bounds.extend([b.latitude!, b.longitude!]);
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [visible, ready, navigate]);

  // Sync hover state — set marker active class
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      marker.setIcon(glowMarkerIcon(id === hoveredId));
      if (id === hoveredId) {
        const el = (marker as L.Marker & { _icon?: HTMLElement })._icon;
        el?.classList.add("is-bouncing");
      }
    });
  }, [hoveredId]);

  return (
    <section className="bg-background">
      <div className="container px-4 py-16">
        <div className="mb-6 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Explore</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-balance md:text-4xl">
            Explore the coast
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {mapped.length} places along 14km of Long Beach. Filter by category — list and map update together.
          </p>
        </div>

        {/* Filter chips — global filter */}
        <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-2">
          {FILTERS.map((f) => {
            const active = filter === f.slug;
            return (
              <button
                key={f.slug}
                type="button"
                onClick={() => setFilter(f.slug)}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <div className="relative h-[420px] w-full overflow-hidden rounded-xl border border-border md:h-[520px]">
          {!ready && (
            <div className="absolute inset-0 z-[1] grid place-items-center bg-secondary">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading map…
              </div>
            </div>
          )}
          <div ref={elRef} className="explore-coast-map h-full w-full" aria-label="Coast map" />
        </div>

        {unmapped > 0 && (
          <p className="mt-3 text-xs text-muted-foreground">
            {unmapped} listing{unmapped === 1 ? "" : "s"} not yet mapped — add coordinates in listing settings.
          </p>
        )}
      </div>
    </section>
  );
};
