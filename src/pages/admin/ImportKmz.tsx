import { useMemo, useRef, useState, ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, MapPin, Image as ImageIcon, Check, X, Download, Loader2, Sparkles } from "lucide-react";
import { AdminLayout, AdminPageHeader } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES } from "@/data/categories";
import { businessStore } from "@/data/businessStore";
import { useToast } from "@/hooks/use-toast";
import {
  parseKmzFile,
  fetchKmlFromUrl,
  folderToBarangay,
  defaultPriceRange,
  type ParsedPlacemark,
} from "@/lib/kml-parser";
import type { Business, Category } from "@/types/business";
import resortDefault from "@/assets/biz-resort.jpg";

const MYMAPS_URL =
  "https://www.google.com/maps/d/u/0/kml?mid=12IZCrcVY8OIAMuekIfTClkciCuQqiaA";

interface Row extends ParsedPlacemark {
  selected: boolean;
  overrideCategory: Category;
  overrideBarangay: string;
}

const ImportKmz = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [filterCat, setFilterCat] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [importing, setImporting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleParsed = (placemarks: ParsedPlacemark[]) => {
    if (!placemarks.length) {
      toast({ title: "No placemarks found", description: "The file did not contain any map pins.", variant: "destructive" });
      return;
    }
    // De-dupe against existing businesses by name
    const existing = new Set(businessStore.list().map((b) => b.name.trim().toLowerCase()));
    const next: Row[] = placemarks.map((p) => ({
      ...p,
      selected: !existing.has(p.name.trim().toLowerCase()),
      overrideCategory: p.category,
      overrideBarangay: folderToBarangay(p.folder),
    }));
    setRows(next);
    const dupes = placemarks.length - next.filter((r) => r.selected).length;
    toast({
      title: `Parsed ${placemarks.length} placemarks`,
      description: dupes ? `${dupes} look like duplicates and were unchecked.` : "Review and import below.",
    });
  };

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const parsed = await parseKmzFile(file);
      handleParsed(parsed);
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to parse file", description: String((err as Error).message ?? err), variant: "destructive" });
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onFetchUrl = async () => {
    setLoading(true);
    try {
      const parsed = await fetchKmlFromUrl(MYMAPS_URL);
      handleParsed(parsed);
    } catch (err) {
      console.error(err);
      toast({
        title: "Couldn't fetch from Google",
        description: "Browser CORS may block this. Please download the KMZ from Google My Maps and upload it instead.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filterCat !== "all" && r.overrideCategory !== filterCat) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.folder.toLowerCase().includes(q) ||
        r.overrideBarangay.toLowerCase().includes(q)
      );
    });
  }, [rows, filterCat, search]);

  const selectedCount = rows.filter((r) => r.selected).length;

  const update = (idx: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const toggleAllVisible = (val: boolean) => {
    const visible = new Set(filtered.map((r) => r.name + r.lat + r.lng));
    setRows((rs) =>
      rs.map((r) => (visible.has(r.name + r.lat + r.lng) ? { ...r, selected: val } : r)),
    );
  };

  const doImport = async () => {
    const toImport = rows.filter((r) => r.selected);
    if (!toImport.length) {
      toast({ title: "Nothing selected", description: "Pick at least one placemark.", variant: "destructive" });
      return;
    }
    setImporting(true);
    try {
      let created = 0;
      for (const r of toImport) {
        const payload: Omit<Business, "id" | "createdAt" | "rating" | "reviewCount" | "viewCount"> & { slug?: string } = {
          name: r.name,
          slug: "",
          category: r.overrideCategory,
          subcategory: r.folder ? r.folder.replace(/[_-]+/g, " ") : undefined,
          phone: "",
          email: "",
          website: "",
          facebook: "",
          instagram: "",
          address: r.overrideBarangay
            ? `${r.overrideBarangay}, San Vicente, Palawan`
            : "San Vicente, Palawan",
          barangay: r.overrideBarangay || "San Vicente",
          googleMapsLink: `https://www.google.com/maps?q=${r.lat},${r.lng}`,
          description: r.description,
          shortDescription: r.shortDescription,
          services: [],
          amenities: [],
          image: r.images[0] || resortDefault,
          images: r.images.length > 1 ? r.images.slice(0, 8) : undefined,
          priceRange: defaultPriceRange(),
          openingHours: {
            mon: "8:00 AM – 9:00 PM", tue: "8:00 AM – 9:00 PM", wed: "8:00 AM – 9:00 PM",
            thu: "8:00 AM – 9:00 PM", fri: "8:00 AM – 10:00 PM", sat: "8:00 AM – 10:00 PM",
            sun: "8:00 AM – 9:00 PM",
          },
          isFeatured: false,
          isVerified: true, // sourced from official LGU/TIEZA list
          isActive: true,
          listingTier: "free",
        };
        businessStore.create(payload);
        created++;
      }
      toast({ title: "Import complete", description: `${created} businesses added to the directory.` });
      navigate("/admin/businesses");
    } catch (err) {
      console.error(err);
      toast({ title: "Import failed", description: String((err as Error).message ?? err), variant: "destructive" });
    } finally {
      setImporting(false);
    }
  };

  return (
    <AdminLayout>
      <Link to="/admin/businesses" className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Businesses
      </Link>
      <AdminPageHeader
        title="Bulk import from KML / KMZ"
        description="Upload a Google My Maps export (.kmz) or .kml file. Placemarks become draft businesses you can review before saving."
      />

      {/* Source picker */}
      {rows.length === 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl gradient-ocean text-primary-foreground">
              <Upload className="h-5 w-5" />
            </div>
            <h2 className="font-display text-lg font-bold">Upload a file</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Accepts .kmz and .kml. Parses Placemarks (name, description, photos, coordinates) and folder names as subcategories.
            </p>
            <input ref={fileRef} type="file" accept=".kmz,.kml,application/vnd.google-earth.kmz,application/vnd.google-earth.kml+xml" hidden onChange={onFile} />
            <Button
              type="button"
              className="mt-4 h-11 w-full rounded-2xl gradient-ocean text-primary-foreground"
              onClick={() => fileRef.current?.click()}
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Upload className="mr-1.5 h-4 w-4" />}
              Choose .kmz or .kml file
            </Button>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl gradient-sunset text-accent-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <h2 className="font-display text-lg font-bold">Try the San Vicente TREs map</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Pull placemarks directly from the public TREs San Vicente, Palawan map. Browser may block this — if so, upload the .kmz instead.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-4 h-11 w-full rounded-2xl"
              onClick={onFetchUrl}
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Download className="mr-1.5 h-4 w-4" />}
              Fetch from Google My Maps
            </Button>
          </div>
        </div>
      )}

      {/* Preview & import */}
      {rows.length > 0 && (
        <>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-card p-4 shadow-soft">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant="secondary" className="rounded-full">{rows.length} parsed</Badge>
              <Badge className="rounded-full border-0 gradient-ocean text-primary-foreground">{selectedCount} selected</Badge>
              <span className="text-muted-foreground">in {new Set(rows.map((r) => r.folder)).size} folders</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => toggleAllVisible(true)}>Select visible</Button>
              <Button variant="ghost" size="sm" onClick={() => toggleAllVisible(false)}>Clear visible</Button>
              <Button variant="outline" size="sm" onClick={() => setRows([])}>Start over</Button>
              <Button
                onClick={doImport}
                disabled={importing || selectedCount === 0}
                className="h-10 rounded-full gradient-sunset text-accent-foreground"
              >
                {importing ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Check className="mr-1.5 h-4 w-4" />}
                Import {selectedCount} {selectedCount === 1 ? "business" : "businesses"}
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-4 flex flex-col gap-2 sm:flex-row">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, folder, or barangay…"
              className="h-11 flex-1 rounded-full"
            />
            <Select value={filterCat} onValueChange={setFilterCat}>
              <SelectTrigger className="h-11 w-full rounded-full sm:w-[220px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Preview list */}
          <ul className="space-y-3">
            {filtered.map((r) => {
              const idx = rows.indexOf(r);
              return (
                <li
                  key={`${r.name}-${r.lat}-${r.lng}`}
                  className={`overflow-hidden rounded-2xl border bg-card shadow-soft transition-colors ${
                    r.selected ? "border-primary/50" : "border-border"
                  }`}
                >
                  <div className="flex flex-col gap-4 p-4 sm:flex-row">
                    <div className="flex items-start gap-3 sm:w-auto">
                      <Checkbox
                        checked={r.selected}
                        onCheckedChange={(v) => update(idx, { selected: !!v })}
                        className="mt-1"
                        aria-label={`Select ${r.name}`}
                      />
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                        {r.images[0] ? (
                          <img src={r.images[0]} alt="" className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-muted-foreground">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{r.name}</p>
                        {r.folder && <Badge variant="outline" className="text-[10px]">{r.folder}</Badge>}
                        {r.images.length > 0 && (
                          <Badge variant="secondary" className="text-[10px]">
                            <ImageIcon className="mr-1 h-3 w-3" />{r.images.length}
                          </Badge>
                        )}
                        <span className="inline-flex items-center text-[11px] text-muted-foreground">
                          <MapPin className="mr-0.5 h-3 w-3" />{r.lat.toFixed(4)}, {r.lng.toFixed(4)}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {r.shortDescription}
                      </p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <div>
                          <Label className="text-[11px] text-muted-foreground">Category</Label>
                          <Select
                            value={r.overrideCategory}
                            onValueChange={(v) => update(idx, { overrideCategory: v as Category })}
                          >
                            <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {CATEGORIES.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-[11px] text-muted-foreground">Barangay</Label>
                          <Input
                            value={r.overrideBarangay}
                            onChange={(e) => update(idx, { overrideBarangay: e.target.value })}
                            className="mt-1 h-9"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {filtered.length === 0 && (
            <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
              <X className="mx-auto mb-2 h-5 w-5" />
              No placemarks match those filters.
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
};

export default ImportKmz;
