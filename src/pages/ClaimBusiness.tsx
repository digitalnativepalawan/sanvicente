import { useEffect, useMemo, useRef, useState, FormEvent, ChangeEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ImagePlus, Send } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES } from "@/data/categories";
import { useBusinessBySlug, slugify } from "@/data/businessStore";
import { useToast } from "@/hooks/use-toast";
import { getBusinessImage } from "@/lib/business-image";
import { submitClaim } from "@/lib/claims";
import type { Business, Category, PriceRange } from "@/types/business";
import resortDefault from "@/assets/biz-resort.jpg";

type FormState = Omit<Business, "id" | "createdAt" | "rating" | "reviewCount" | "viewCount">;

const days: { key: keyof FormState["openingHours"]; label: string }[] = [
  { key: "mon", label: "Mon" }, { key: "tue", label: "Tue" }, { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" }, { key: "fri", label: "Fri" }, { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

const ClaimBusiness = () => {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const business = useBusinessBySlug(slug);
  const fileRef = useRef<HTMLInputElement>(null);

  const initial = useMemo<FormState | null>(() => {
    if (!business) return null;
    const { id, createdAt, rating, reviewCount, viewCount, ...rest } = business;
    return { ...rest } as FormState;
  }, [business]);

  const [form, setForm] = useState<FormState | null>(initial);
  const [servicesText, setServicesText] = useState("");
  const [amenitiesText, setAmenitiesText] = useState("");
  const [owner, setOwner] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = business ? `Claim ${business.name} | San Vicente Directory` : "Claim business";
  }, [business?.name]);

  useEffect(() => {
    if (initial) {
      setForm(initial);
      setServicesText((initial.services ?? []).join(", "));
      setAmenitiesText((initial.amenities ?? []).join(", "));
    }
  }, [initial]);

  if (!business || !form) {
    return (
      <Layout>
        <div className="container px-4 py-24 text-center">
          <h1 className="font-display text-3xl font-bold">Business not found</h1>
          <Link to="/" className="mt-4 inline-block text-primary hover:underline">Back home</Link>
        </div>
      </Layout>
    );
  }

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  const onImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Please choose an image under 3 MB.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const nextImage = String(reader.result);
      setForm((current) => current ? ({
        ...current,
        image: nextImage,
        images: [nextImage, ...(current.images ?? []).filter((img) => img && img !== nextImage)].slice(0, 8),
      }) : current);
    };
    reader.readAsDataURL(file);
  };

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
    const normalizedImages = [form.image, ...(form.images ?? [])]
      .filter((img, index, arr): img is string => !!img && arr.indexOf(img) === index)
      .slice(0, 8);
    const proposed = { ...form, services, amenities, slug: form.slug || slugify(form.name), images: normalizedImages };

    setSubmitting(true);
    try {
      await submitClaim({
        businessId: business.id,
        ownerName: owner.name.trim(),
        ownerEmail: owner.email.trim(),
        ownerPhone: owner.phone.trim(),
        ownerMessage: owner.message.trim() || undefined,
        proposedData: proposed,
      });
      toast({
        title: "Claim submitted",
        description: "Thanks! An admin will review your information shortly.",
      });
      navigate(`/business/${business.slug}`);
    } catch (err: any) {
      toast({ title: "Submission failed", description: err?.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container px-4 py-8 md:py-12">
        <Link to={`/business/${business.slug}`} className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to {business.name}
        </Link>
        <header className="mb-8">
          <h1 className="font-display text-3xl font-bold md:text-4xl">Claim {business.name}</h1>
          <p className="mt-2 text-muted-foreground">
            Review the listing details below, update anything that's wrong, and tell us how to verify you. An admin will review and apply approved changes.
          </p>
        </header>

        <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            {/* Owner info */}
            <section className="rounded-3xl border border-primary/30 bg-primary/5 p-6 shadow-soft">
              <h2 className="font-display text-lg font-bold">Your contact details (owner)</h2>
              <p className="mt-1 text-sm text-muted-foreground">We'll use this to verify ownership.</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2"><Label>Full name *</Label><Input value={owner.name} onChange={(e) => setOwner((o) => ({ ...o, name: e.target.value }))} className="mt-1.5 h-11" required maxLength={120} /></div>
                <div><Label>Email *</Label><Input type="email" value={owner.email} onChange={(e) => setOwner((o) => ({ ...o, email: e.target.value }))} className="mt-1.5 h-11" required maxLength={255} /></div>
                <div><Label>Phone *</Label><Input value={owner.phone} onChange={(e) => setOwner((o) => ({ ...o, phone: e.target.value }))} className="mt-1.5 h-11" required maxLength={40} /></div>
                <div className="sm:col-span-2"><Label>Message to admin</Label><Textarea value={owner.message} onChange={(e) => setOwner((o) => ({ ...o, message: e.target.value }))} rows={3} className="mt-1.5" maxLength={1000} placeholder="Optional — anything that helps us verify you own this business." /></div>
              </div>
            </section>

            {/* Basics */}
            <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <h2 className="font-display text-lg font-bold">Basic info</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label>Business name *</Label>
                  <Input value={form.name} onChange={(e) => update("name", e.target.value)} className="mt-1.5 h-11" required />
                </div>
                <div>
                  <Label>Category *</Label>
                  <Select value={form.category} onValueChange={(v) => update("category", v as Category)}>
                    <SelectTrigger className="mt-1.5 h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Subcategory</Label>
                  <Input value={form.subcategory ?? ""} onChange={(e) => update("subcategory", e.target.value)} className="mt-1.5 h-11" />
                </div>
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
                <div className="sm:col-span-2">
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={5} className="mt-1.5" />
                </div>
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
                    <Input
                      value={form.openingHours[d.key] ?? ""}
                      onChange={(e) => update("openingHours", { ...form.openingHours, [d.key]: e.target.value })}
                      placeholder="Closed"
                      className="h-11"
                    />
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <h2 className="font-display text-lg font-bold">Cover photo</h2>
              <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-muted">
                <img
                  src={getBusinessImage(form as any) || resortDefault}
                  alt="Cover preview"
                  className="aspect-[4/3] w-full object-cover"
                  onError={(ev) => { (ev.currentTarget as HTMLImageElement).src = resortDefault; }}
                />
              </div>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={onImage} />
              <Button type="button" variant="outline" className="mt-3 h-11 w-full rounded-2xl" onClick={() => fileRef.current?.click()}>
                <ImagePlus className="mr-1.5 h-4 w-4" /> Replace photo
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">JPG/PNG up to 3 MB.</p>
            </section>

            <Button type="submit" disabled={submitting} className="h-12 w-full rounded-2xl gradient-ocean text-primary-foreground">
              <Send className="mr-1.5 h-4 w-4" /> {submitting ? "Submitting…" : "Submit claim for review"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              By submitting, you confirm you're the owner or authorized representative.
            </p>
          </aside>
        </form>
      </div>
    </Layout>
  );
};

export default ClaimBusiness;
