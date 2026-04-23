import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { Loader2, MapPin } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES } from "@/data/categories";

// Fix Leaflet's default marker icons in bundlers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete ((L.Icon.Default.prototype as any))._getIconUrl;
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
  short_description: string;
  latitude: number;
  longitude: number;
}

const SAN_VICENTE: [number, number] = [10.4762, 119.2182];

const categoryLabel = (slug: string) =>
  CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;

const MapView = () => {
  const { theme } = useTheme();
  const [businesses, setBusinesses] = useState<MapBusiness[]>([]);
  const [loading, setLoading] = useState(true);

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
        .filter((r) => r.is_active !== false)
        .map((r) => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          category: r.category,
          short_description: r.short_description ?? "",
          latitude: Number(r.latitude),
          longitude: Number(r.longitude),
        }))
        .filter((r) => Number.isFinite(r.latitude) && Number.isFinite(r.longitude));
      setBusinesses(rows);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
          <MapContainer
            center={SAN_VICENTE}
            zoom={12}
            scrollWheelZoom
            className="h-full w-full"
          >
            <TileLayer key={theme} url={tile.url} attribution={tile.attribution} />
            {businesses.map((b) => (
              <Marker key={b.id} position={[b.latitude, b.longitude]}>
                <Popup>
                  <div className="min-w-[200px] space-y-2">
                    <p className="font-semibold leading-tight">{b.name}</p>
                    <Badge variant="secondary" className="text-[10px]">
                      {categoryLabel(b.category)}
                    </Badge>
                    {b.short_description && (
                      <p className="text-xs text-muted-foreground line-clamp-3">
                        {b.short_description}
                      </p>
                    )}
                    <Button asChild size="sm" className="h-8 w-full rounded-full">
                      <Link to={`/business/${b.slug}`}>View Details</Link>
                    </Button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MapView;
