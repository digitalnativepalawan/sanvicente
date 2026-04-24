import { useEffect, useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES } from "@/data/categories";
import { slugify } from "@/data/businessStore";
import { useToast } from "@/hooks/use-toast";
import { submitListing } from "@/lib/submissions";
import { MultiImageUpload } from "@/components/MultiImageUpload";
import { RoomTypesEditor } from "@/components/RoomTypesEditor";
import type { Business, Category, PriceRange } from "@/types/business";

type FormState = Omit<Business, "id" | "createdAt" | "rating" | "reviewCount" | "viewCount">;

const empty: FormState = {
  name: "", slug: "", category: "restaurants", subcategory: "",
  phone: "", email: "", website: "", facebook: "", instagram: "",
  address: "", barangay: "", googleMapsLink: "",
  description: "", shortDescription: "",
  services: [], amenities: [],
  image: "", images: [], menuImages: [], roomTypes: [],
  priceRange: "₱₱",
  openingHours: {
    mon: "", tue: "", wed: "", thu: "", fri: "", sat: "", sun: "",
  },
  isFeatured: false, isVerified: false, isActive: true, listingTier: "free",
};

const days: { key: keyof FormState["openingHours"]; label: string }[] = [
  { key: "mon", label: "Mon" }, { key: "tue", label: "Tue" }, { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" }, { key: "fri", label: "Fri" }, { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

const MENU_CATEGORIES: Category[] = ["restaurants", "resorts", "tours", "shops"];

const ListBusiness = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(empty);
  const [servicesText, setServicesText] = useState("");
  const [amenitiesText, setAmenitiesText] = useState("");
  const [owner, setOwner] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "List your business | San Vicente Directory";
  }, []);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));
  const setGallery = (images: string[]) => setForm((f) => ({ ...f, images, image: images[0] ?? "" }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!owner.name.trim() || !owner.email.trim() || !owner.phone.trim()) {
      toast({ title: "Owner info required", description: "Please provide your name, email, and phone.", variant: "destructive" });
      return;
    }
    if (!form.name || !form.barangay || !form.address || !form.shortDescription) {
      toast({ title: "Missing fields", description: "Name, address, barangay, and short description are required.", variant: "destructive" });
      return;
    }

    const services = servicesText.split(",").map((s) => s.trim()).filter(Boolean);
    const amenities = amenitiesText.split(",").map((s) => s.trim()).filter(Boolean);
    const images = (form.images ?? []).slice(0, 6);
    const cover = images[0] ?? "";
    const proposed = { ...form, services, amenities, slug: form.slug || slugify(form.name), images, image: cover };

    setSubmitting(true);
    try {
      await submitListing({
        ownerName: owner.name.trim(),
        ownerEmail: owner.email.trim(),
        ownerPhone: owner.phone.trim(),
        ownerMessage: owner.message.trim() || undefined,
        proposedData: proposed,
      });
      toast({ title: "Listing submitted!", description: "Thanks! An admin will review and publish your business shortly." });
      navigate("/");
    } catch (err: any) {
      toast({ title: "Submission failed", description: err?.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const showMenu = MENU_CATEGORIES.includes(form.category);
  const showRooms = form.category === "resorts";

  return (
    <Layout>
      <div className="container px-4 py-8 md:py-12">
        <Link to="/" className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back home
        </Link>
        <header className="mb-8">
          <h1 className="font-display text-3xl font-bold md:text-4xl">List your business</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Add your business to the San Vicente Directory. Fill in the details below — an admin will review and publish your listing.
          </p>
        </header>

        <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            {/* Owner info */}
            <section className="rounded-3xl border border-primary/30 bg-primary/5 p-6 shadow-soft">
              <h2 className="font-display text-lg font-bold">Your contact details</h2>
              <p className="mt-1 text-sm text-muted-foreground">We'll use this to reach you about your listing.</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2"><Label>Full name *</Label><Input value={owner.name} onChange={(e) => setOwner((o) => ({ ...o, name: e.target.value }))} className="mt-1.5 h-11" required maxLength={120} /></div>
                <div><Label>Email *</Label><Input type="email" value={owner.email} onChange={(e) => setOwner((o) => ({ ...o, email: e.target.value }))} className="mt-1.5 h-11" required maxLength={255} /></div>
                <div><Label>Phone *</Label><Input value={owner.phone} onChange={(e) => setOwner((o) => ({ ...o, phone: e.target.value }))} className="mt-1.5 h-11" required maxLength={40} /></div>
                <div className="sm:col-span-2"><Label>Message to admin</Label><Textarea value={owner.message} onChange={(e) => setOwner((o) => ({ ...o, message: e.target.value }))} rows={3} className="mt-1.5" maxLength={1000} placeholder="Optional notes for the reviewer." /></div>
              </div>
            </section>

            {/* Photos */}
            <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <h2 className="font-display text-lg font-bold">Photos</h2>
              <p className="mt-1 text-sm text-muted-foreground">First photo is the cover. Up to 6 images, JPG/PNG, 3 MB each.</p>
              <div className="mt-4">
                <MultiImageUpload value={form.images ?? []} onChange={setGallery} max={6} folder="submission" />
              </div>
            </section>

            {/* Basics */}
            <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <h2 className="font-display text-lg font-bold">Basic info</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2"><Label>Business name *</Label><Input value={form.name} onChange={(e) => update("name", e.target.value)} className="mt-1.5 h-11" required /></div>
                <div>
                  <Label>Category *</Label>
                  <Select value={form.category} onValueChange={(v) => update("category", v as Category)}>
                    <SelectTrigger className="mt-1.5 h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Subcategory</Label><Input value={form.subcategory ?? ""} onChange={(e) => update("subcategory", e.target.value)} className="mt-1.5 h-11" placeholder="e.g. Boutique Resort" /></div>
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
                <div><Label>Website</Label><Input value={form.website ?? ""} onChange={(e) => update("website", e.target.value)} className="mt-1.5 h-11" placeholder="https://" /></div>
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

            {/* Menu */}
            {showMenu && (
              <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                <h2 className="font-display text-lg font-bold">Menu / brochure photos</h2>
                <p className="mt-1 text-sm text-muted-foreground">Upload menu, brochure or price list photos. Up to 10 images.</p>
                <div className="mt-4">
                  <MultiImageUpload
                    value={form.menuImages ?? []}
                    onChange={(menuImages) => update("menuImages", menuImages)}
                    max={10}
                    folder="submission/menu"
                    showCoverBadge={false}
                    label="Menu photos"
                  />
                </div>
              </section>
            )}

            {/* Rooms */}
            {showRooms && (
              <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                <h2 className="font-display text-lg font-bold">Room types</h2>
                <p className="mt-1 text-sm text-muted-foreground">Add each room category with photos, price, and capacity.</p>
                <div className="mt-4">
                  <RoomTypesEditor value={form.roomTypes ?? []} onChange={(roomTypes) => update("roomTypes", roomTypes)} folder="submission/rooms" />
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <Button type="submit" disabled={submitting} className="h-12 w-full rounded-2xl gradient-ocean text-primary-foreground">
              <Send className="mr-1.5 h-4 w-4" /> {submitting ? "Submitting…" : "Submit for review"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              By submitting, you confirm the information is accurate and you have permission to list this business.
            </p>
          </aside>
        </form>
      </div>
    </Layout>
  );
};

export default ListBusiness;
