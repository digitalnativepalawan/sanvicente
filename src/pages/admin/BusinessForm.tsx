import { useEffect, useState, FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Trash2, Star, BadgeCheck, Eye } from "lucide-react";
import { AdminLayout, AdminPageHeader } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES } from "@/data/categories";
import { businessStore, slugify } from "@/data/businessStore";
import { useToast } from "@/hooks/use-toast";
import { MultiImageUpload } from "@/components/MultiImageUpload";
import { RoomTypesEditor } from "@/components/RoomTypesEditor";
import type { Business, Category, PriceRange } from "@/types/business";

type FormState = Omit<Business, "id" | "createdAt" | "rating" | "reviewCount" | "viewCount">;

const empty: FormState = {
  name: "", slug: "", category: "resorts", subcategory: "",
  phone: "", email: "", website: "", facebook: "", instagram: "",
  address: "", barangay: "", googleMapsLink: "",
  description: "", shortDescription: "",
  services: [], amenities: [],
  image: "", images: [], menuImages: [], roomTypes: [],
  priceRange: "₱₱",
  openingHours: {
    mon: "8:00 AM – 9:00 PM", tue: "8:00 AM – 9:00 PM", wed: "8:00 AM – 9:00 PM",
    thu: "8:00 AM – 9:00 PM", fri: "8:00 AM – 10:00 PM", sat: "8:00 AM – 10:00 PM",
    sun: "8:00 AM – 9:00 PM",
  },
  isFeatured: false, isVerified: false, isActive: true, listingTier: "free",
};

const days: { key: keyof FormState["openingHours"]; label: string }[] = [
  { key: "mon", label: "Mon" }, { key: "tue", label: "Tue" }, { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" }, { key: "fri", label: "Fri" }, { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

const MENU_CATEGORIES: Category[] = ["restaurants", "resorts", "tours", "shops"];

const BusinessForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const existing = isEdit ? businessStore.get(id!) : undefined;
  const [form, setForm] = useState<FormState>(() => existing ? { ...empty, ...existing } : empty);
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [servicesText, setServicesText] = useState((existing?.services ?? []).join(", "));
  const [amenitiesText, setAmenitiesText] = useState((existing?.amenities ?? []).join(", "));
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    document.title = isEdit ? `Edit ${existing?.name ?? "business"} · Admin` : "New business · Admin";
  }, [isEdit, existing?.name]);

  if (isEdit && !existing) {
    return (
      <AdminLayout>
        <AdminPageHeader title="Not found" description="This business no longer exists." />
        <Button asChild variant="outline"><Link to="/admin/businesses"><ArrowLeft className="mr-1.5 h-4 w-4" />Back</Link></Button>
      </AdminLayout>
    );
  }

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const onName = (v: string) => {
    update("name", v);
    if (!slugTouched) update("slug", slugify(v));
  };

  const setGallery = (images: string[]) => {
    setForm((f) => ({ ...f, images, image: images[0] ?? f.image ?? "" }));
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const services = servicesText.split(",").map((s) => s.trim()).filter(Boolean);
    const amenities = amenitiesText.split(",").map((s) => s.trim()).filter(Boolean);
    const images = (form.images ?? []).slice(0, 6);
    const cover = images[0] ?? form.image ?? "";
    const payload = { ...form, services, amenities, slug: form.slug || slugify(form.name), images, image: cover };

    if (!payload.name || !payload.barangay || !payload.address || !payload.shortDescription) {
      toast({ title: "Missing fields", description: "Name, address, barangay, and short description are required.", variant: "destructive" });
      return;
    }

    if (isEdit) {
      businessStore.update(id!, payload);
      toast({ title: "Saved", description: `${payload.name} updated.` });
    } else {
      const created = businessStore.create(payload);
      toast({ title: "Created", description: `${created.name} added to directory.` });
    }
    navigate("/admin/businesses");
  };

  const onDelete = () => {
    if (!isEdit || !id) return;
    if (!confirm("Delete this business? This cannot be undone.")) return;
    businessStore.remove(id);
    toast({ title: "Deleted" });
    navigate("/admin/businesses");
  };

  const showMenu = MENU_CATEGORIES.includes(form.category);
  const showRooms = form.category === "resorts";

  return (
    <AdminLayout>
      <Link to="/admin/businesses" className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All businesses
      </Link>
      <AdminPageHeader
        title={isEdit ? "Edit business" : "Add business"}
        description={isEdit ? existing?.name : "Create a new directory listing."}
        action={
          isEdit && existing ? (
            <Button asChild variant="outline" className="h-11 rounded-full">
              <Link to={`/business/${existing.slug}`} target="_blank"><Eye className="mr-1.5 h-4 w-4" />Preview</Link>
            </Button>
          ) : undefined
        }
      />

      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* Photos */}
          <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold">Photos</h2>
            <p className="mt-1 text-sm text-muted-foreground">First photo is the cover. Up to 6 images, JPG/PNG, 3 MB each.</p>
            <div className="mt-4">
              <MultiImageUpload value={form.images ?? []} onChange={setGallery} max={6} folder={`business/${form.slug || "new"}`} />
            </div>
          </section>

          {/* Basics */}
          <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold">Basic info</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><Label>Business name *</Label><Input value={form.name} onChange={(e) => onName(e.target.value)} className="mt-1.5 h-11" required /></div>
              <div><Label>URL slug</Label><Input value={form.slug} onChange={(e) => { setSlugTouched(true); update("slug", slugify(e.target.value)); }} className="mt-1.5 h-11" placeholder="auto-generated" /></div>
              <div>
                <Label>Category *</Label>
                <Select value={form.category} onValueChange={(v) => update("category", v as Category)}>
                  <SelectTrigger className="mt-1.5 h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Subcategory</Label><Input value={form.subcategory ?? ""} onChange={(e) => update("subcategory", e.target.value)} className="mt-1.5 h-11" /></div>
              <div>
                <Label>Price range</Label>
                <Select value={form.priceRange} onValueChange={(v) => update("priceRange", v as PriceRange)}>
                  <SelectTrigger className="mt-1.5 h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="₱">₱ Budget</SelectItem>
                    <SelectItem value="₱₱">₱₱ Mid-range</SelectItem>
                    <SelectItem value="₱₱₱">₱₱₱ Upscale</SelectItem>
                    <SelectItem value="₱₱₱₱">₱₱₱₱ Luxury</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label>Short description *</Label>
                <Input value={form.shortDescription} onChange={(e) => update("shortDescription", e.target.value)} maxLength={140} className="mt-1.5 h-11" required />
                <p className="mt-1 text-xs text-muted-foreground">{form.shortDescription.length}/140</p>
              </div>
              <div className="sm:col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={5} className="mt-1.5" /></div>
            </div>
          </section>

          {/* Contact */}
          <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold">Contact & location</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div><Label>Phone</Label><Input value={form.phone ?? ""} onChange={(e) => update("phone", e.target.value)} className="mt-1.5 h-11" /></div>
              <div><Label>Email</Label><Input type="email" value={form.email ?? ""} onChange={(e) => update("email", e.target.value)} className="mt-1.5 h-11" /></div>
              <div><Label>Website</Label><Input value={form.website ?? ""} onChange={(e) => update("website", e.target.value)} className="mt-1.5 h-11" /></div>
              <div><Label>Facebook URL</Label><Input value={form.facebook ?? ""} onChange={(e) => update("facebook", e.target.value)} className="mt-1.5 h-11" /></div>
              <div><Label>Instagram</Label><Input value={form.instagram ?? ""} onChange={(e) => update("instagram", e.target.value)} className="mt-1.5 h-11" /></div>
              <div><Label>Google Maps link</Label><Input value={form.googleMapsLink ?? ""} onChange={(e) => update("googleMapsLink", e.target.value)} className="mt-1.5 h-11" /></div>
              <div className="sm:col-span-2"><Label>Address *</Label><Input value={form.address} onChange={(e) => update("address", e.target.value)} className="mt-1.5 h-11" required /></div>
              <div><Label>Barangay *</Label><Input value={form.barangay} onChange={(e) => update("barangay", e.target.value)} className="mt-1.5 h-11" required /></div>
            </div>
          </section>

          {/* Lists */}
          <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold">Services & amenities</h2>
            <p className="mt-1 text-sm text-muted-foreground">Comma-separated lists.</p>
            <div className="mt-4 space-y-4">
              <div><Label>Services</Label><Textarea value={servicesText} onChange={(e) => setServicesText(e.target.value)} rows={2} className="mt-1.5" /></div>
              <div><Label>Amenities</Label><Textarea value={amenitiesText} onChange={(e) => setAmenitiesText(e.target.value)} rows={2} className="mt-1.5" /></div>
            </div>
          </section>

          {/* Hours */}
          <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold">Opening hours</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {days.map((d) => (
                <div key={d.key} className="flex items-center gap-3">
                  <span className="w-12 shrink-0 text-sm font-medium">{d.label}</span>
                  <Input value={form.openingHours[d.key] ?? ""} onChange={(e) => update("openingHours", { ...form.openingHours, [d.key]: e.target.value })} placeholder="Closed" className="h-11" />
                </div>
              ))}
            </div>
          </section>

          {/* Menu images */}
          {showMenu && (
            <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <h2 className="font-display text-lg font-bold">Menu / brochure photos</h2>
              <p className="mt-1 text-sm text-muted-foreground">Upload photos of menus, brochures, or price lists. Up to 10 images.</p>
              <div className="mt-4">
                <MultiImageUpload
                  value={form.menuImages ?? []}
                  onChange={(menuImages) => update("menuImages", menuImages)}
                  max={10}
                  folder={`business/${form.slug || "new"}/menu`}
                  showCoverBadge={false}
                  label="Menu photos"
                />
              </div>
            </section>
          )}

          {/* Room types — resorts only */}
          {showRooms && (
            <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <h2 className="font-display text-lg font-bold">Room types</h2>
              <p className="mt-1 text-sm text-muted-foreground">Add each room category with photos, price, and capacity.</p>
              <div className="mt-4">
                <RoomTypesEditor value={form.roomTypes ?? []} onChange={(roomTypes) => update("roomTypes", roomTypes)} folder={`business/${form.slug || "new"}/rooms`} />
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-32 lg:self-start">
          <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold">Visibility</h2>
            <div className="mt-4 space-y-4">
              <label className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm"><Star className="h-4 w-4 text-accent" />Featured</span>
                <Switch checked={form.isFeatured} onCheckedChange={(v) => { update("isFeatured", v); update("listingTier", v ? "featured" : "free"); }} />
              </label>
              <label className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm"><BadgeCheck className="h-4 w-4 text-primary" />Verified</span>
                <Switch checked={form.isVerified} onCheckedChange={(v) => update("isVerified", v)} />
              </label>
              <label className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm"><Eye className="h-4 w-4" />Active (visible publicly)</span>
                <Switch checked={form.isActive} onCheckedChange={(v) => update("isActive", v)} />
              </label>
            </div>
          </section>

          <div className="space-y-2">
            <Button type="submit" className="h-12 w-full rounded-2xl gradient-ocean text-primary-foreground">
              <Save className="mr-1.5 h-4 w-4" />{isEdit ? "Save changes" : "Create business"}
            </Button>
            {isEdit && (
              <Button type="button" variant="outline" className="h-12 w-full rounded-2xl text-destructive hover:text-destructive" onClick={onDelete}>
                <Trash2 className="mr-1.5 h-4 w-4" />Delete
              </Button>
            )}
          </div>
        </aside>
      </form>
    </AdminLayout>
  );
};

export default BusinessForm;
