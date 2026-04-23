import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { Loader2, MapPin } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useTheme } from "@/hooks/use-theme";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES } from "@/data/categories";

// Fix Leaflet's default marker icons in bundlers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface MapBusiness {
  id: string;
  name: string;
  slug: string;
  category: string;
  shortDescription: string;
  latitude: number;
  longitude: number;
}

const SAN_VICENTE: L.LatLngExpression = [10.4762, 119.2182];

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

const categoryLabel = (slug: string) =>
  CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;

const MapView = () => {
  const { theme } = useTheme();
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [businesses, setBusinesses] = useState<MapBusiness[]>([]);
  const [loading, setLoading] = useState(true);

  const tile = useMemo(() => {
    if (theme === "dark") {
      return {
        url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      };
    }

    return {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    };
  }, [theme]);

  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) return;

    const map = L.map(mapElementRef.current, {
      center: SAN_VICENTE,
      zoom: 12,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    mapRef.current = map;
    tileLayerRef.current = L.tileLayer(tile.url, {
      attribution: tile.attribution,
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      markersLayerRef.current?.clearLayers();
      markersLayerRef.current = null;
      tileLayerRef.current?.remove();
      tileLayerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, [tile]);

  useEffect(() => {
    if (!mapRef.current) return;

    tileLayerRef.current?.remove();
    tileLayerRef.current = L.tileLayer(tile.url, {
      attribution: tile.attribution,
      maxZoom: 19,
    }).addTo(mapRef.current);
  }, [tile]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from("businesses" as any)
        .select("id,name,slug,category,short_description,latitude,longitude,is_active")
        .not("latitude", "is", null)
        .not("longitude", "is", null);

      if (cancelled) return;

      if (error) {
        console.error("Failed to load map businesses", error);
        setLoading(false);
        return;
      }

      const rows = ((data as any[]) ?? [])
        .filter((row) => row.is_active !== false)
        .map((row) => ({
          id: row.id,
          name: row.name,
          slug: row.slug,
          category: row.category,
          shortDescription: row.short_description ?? "",
          latitude: Number(row.latitude),
          longitude: Number(row.longitude),
        }))
        .filter((row) => Number.isFinite(row.latitude) && Number.isFinite(row.longitude));

      setBusinesses(rows);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    const map = mapRef.current;
    const layer = markersLayerRef.current;
    layer.clearLayers();

    if (businesses.length === 0) {
      map.setView(SAN_VICENTE, 12);
      return;
    }

    const bounds = L.latLngBounds([]);

    businesses.forEach((business) => {
      const marker = L.marker([business.latitude, business.longitude]);
      const popupHtml = `
        <div class="min-w-[200px] space-y-2">
          <p class="font-semibold leading-tight">${escapeHtml(business.name)}</p>
          <span class="inline-flex rounded-full bg-secondary px-2 py-1 text-[10px] font-medium text-secondary-foreground">${escapeHtml(categoryLabel(business.category))}</span>
          ${business.shortDescription ? `<p class="text-xs text-muted-foreground">${escapeHtml(business.shortDescription)}</p>` : ""}
          <a href="/business/${encodeURIComponent(business.slug)}" class="inline-flex h-8 w-full items-center justify-center rounded-full bg-primary px-3 text-sm font-medium text-primary-foreground no-underline">View Details</a>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.addTo(layer);
      bounds.extend([business.latitude, business.longitude]);
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [32, 32], maxZoom: 15 });
    }
  }, [businesses]);

  useEffect(() => {
    if (!mapRef.current) return;

    const timeout = window.setTimeout(() => {
      mapRef.current?.invalidateSize();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [loading]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="container px-4 pb-4 pt-6">
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            Map View
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Explore every business pinned on the San Vicente map.
            {!loading && businesses.length > 0 && (
              <span className="ml-1">{businesses.length} locations.</span>
            )}
          </p>
        </section>

        <div className="relative h-[calc(100vh-13rem)] min-h-[480px] w-full overflow-hidden border-y border-border">
          {loading && (
            <div className="absolute inset-0 z-[500] grid place-items-center bg-background/60 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading map…
              </div>
            </div>
          )}

          {!loading && businesses.length === 0 && (
            <div className="absolute inset-x-0 top-4 z-[500] mx-auto w-fit max-w-[90%] rounded-2xl border border-border bg-card px-4 py-3 text-center text-sm text-muted-foreground shadow-soft">
              <MapPin className="mr-1 inline h-4 w-4" />
              No businesses with coordinates yet — re-import your KMZ from Admin → Import KMZ.
            </div>
          )}

          <div ref={mapElementRef} className="h-full w-full" aria-label="Business map" />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MapView;
