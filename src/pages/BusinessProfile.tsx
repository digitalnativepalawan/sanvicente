import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  BadgeCheck,
  ChevronLeft,
  Clock,
  Facebook,
  Globe,
  Heart,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Share2,
  Star,
  Flag,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BusinessCard } from "@/components/BusinessCard";
import { useFavorites } from "@/hooks/use-favorites";
import { useToast } from "@/hooks/use-toast";
import { useBusinesses, useBusinessBySlug, analytics } from "@/data/businessStore";
import { CATEGORIES } from "@/data/categories";

const dayLabels: Record<string, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

const BusinessProfile = () => {
  const { slug = "" } = useParams();
  const business = useBusinessBySlug(slug);
  const allBusinesses = useBusinesses();
  const { has, toggle } = useFavorites();
  const { toast } = useToast();

  useEffect(() => {
    if (business) analytics.trackView(business.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business?.id]);

  useEffect(() => {
    if (business) {
      document.title = `${business.name} | San Vicente Directory`;
      // Schema.org LocalBusiness
      const ld = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: business.name,
        description: business.shortDescription,
        address: { "@type": "PostalAddress", streetAddress: business.address, addressLocality: "San Vicente", addressRegion: "Palawan", addressCountry: "PH" },
        telephone: business.phone,
        priceRange: business.priceRange,
        aggregateRating: { "@type": "AggregateRating", ratingValue: business.rating, reviewCount: business.reviewCount },
      };
      let script = document.getElementById("biz-jsonld") as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.id = "biz-jsonld";
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(ld);
      return () => { script?.remove(); };
    }
  }, [business]);

  if (!business) {
    return (
      <Layout>
        <div className="container px-4 py-24 text-center">
          <h1 className="font-display text-3xl font-bold">Business not found</h1>
          <Link to="/" className="mt-4 inline-block text-primary hover:underline">Back home</Link>
        </div>
      </Layout>
    );
  }

  const cat = CATEGORIES.find((c) => c.slug === business.category);
  const fav = has(business.id);
  const related = allBusinesses.filter((b) => b.category === business.category && b.id !== business.id && b.isActive).slice(0, 3);
  const mapsLink = business.googleMapsLink || `https://maps.google.com/?q=${encodeURIComponent(`${business.name} San Vicente Palawan`)}`;

  const handleShare = async () => {
    const data = { title: business.name, text: business.shortDescription, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: "Link copied", description: "Share link copied to clipboard." });
      }
    } catch { /* noop */ }
  };

  return (
    <Layout>
      {/* Hero image */}
      <section className="relative h-[42vh] min-h-[280px] w-full overflow-hidden md:h-[55vh]">
        <img
          src={business.image}
          alt={business.name}
          className="h-full w-full object-cover"
          width={1280}
          height={896}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <div className="container absolute inset-x-0 top-4 px-4">
          <Link
            to={`/category/${business.category}`}
            className="inline-flex items-center gap-1 rounded-full bg-background/85 px-3 py-1.5 text-sm font-medium backdrop-blur hover:bg-background"
          >
            <ChevronLeft className="h-4 w-4" /> {cat?.label}
          </Link>
        </div>
      </section>

      <div className="container px-4 pb-20">
        {/* Title block */}
        <div className="-mt-20 rounded-3xl border border-border bg-card p-6 shadow-card md:-mt-24 md:p-10">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="secondary" className="rounded-full">{cat?.label}</Badge>
            {business.subcategory && <Badge variant="outline" className="rounded-full">{business.subcategory}</Badge>}
            {business.isFeatured && (
              <Badge className="rounded-full border-0 gradient-sunset text-accent-foreground">Featured</Badge>
            )}
          </div>

          <h1 className="mt-3 flex flex-wrap items-center gap-2 font-display text-3xl font-bold text-balance md:text-5xl">
            {business.name}
            {business.isVerified && <BadgeCheck className="h-7 w-7 text-primary" aria-label="Verified" />}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <strong className="text-foreground">{business.rating.toFixed(1)}</strong> ({business.reviewCount} reviews)
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> {business.barangay}
            </span>
            <span>{business.priceRange}</span>
          </div>

          {/* Quick actions */}
          <div className="mt-6 grid grid-cols-2 gap-2 md:grid-cols-4">
            {business.phone && (
              <Button asChild className="h-12 rounded-2xl gradient-ocean text-primary-foreground hover:opacity-95">
                <a href={`tel:${business.phone}`}><Phone className="mr-2 h-4 w-4" />Call</a>
              </Button>
            )}
            <Button asChild variant="outline" className="h-12 rounded-2xl">
              <a href={mapsLink} target="_blank" rel="noopener noreferrer"><Navigation className="mr-2 h-4 w-4" />Directions</a>
            </Button>
            {business.website && (
              <Button asChild variant="outline" className="h-12 rounded-2xl">
                <a href={business.website} target="_blank" rel="noopener noreferrer"><Globe className="mr-2 h-4 w-4" />Website</a>
              </Button>
            )}
            <Button onClick={() => toggle(business.id)} variant="outline" className="h-12 rounded-2xl">
              <Heart className={`mr-2 h-4 w-4 ${fav ? "fill-accent text-accent" : ""}`} />
              {fav ? "Saved" : "Save"}
            </Button>
          </div>
        </div>

        {/* Body grid */}
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
          {/* Main */}
          <div className="space-y-10">
            <section>
              <h2 className="font-display text-2xl font-bold">About</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{business.description}</p>
            </section>

            {business.services.length > 0 && (
              <section>
                <h2 className="font-display text-2xl font-bold">Services</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {business.services.map((s) => (
                    <Badge key={s} variant="secondary" className="rounded-full px-3 py-1.5 text-sm font-normal">{s}</Badge>
                  ))}
                </div>
              </section>
            )}

            {business.amenities.length > 0 && (
              <section>
                <h2 className="font-display text-2xl font-bold">Amenities</h2>
                <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {business.amenities.map((a) => (
                    <li key={a} className="flex items-center gap-2 rounded-xl bg-secondary/50 px-3 py-2 text-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      {a}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Map */}
            <section>
              <h2 className="font-display text-2xl font-bold">Location</h2>
              <p className="mt-2 text-sm text-muted-foreground">{business.address}, San Vicente, Palawan</p>
              <div className="mt-4 overflow-hidden rounded-3xl border border-border">
                <iframe
                  title={`Map of ${business.name}`}
                  src={`https://www.google.com/maps?q=${encodeURIComponent(`${business.name} San Vicente Palawan`)}&output=embed`}
                  loading="lazy"
                  className="h-[320px] w-full md:h-[420px]"
                />
              </div>
            </section>

            {/* Footer actions */}
            <div className="flex flex-wrap gap-2 border-t border-border pt-6">
              <Button onClick={handleShare} variant="ghost" className="h-11 rounded-full">
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
              <Button variant="ghost" className="h-11 rounded-full text-muted-foreground">
                <Flag className="mr-2 h-4 w-4" /> Report incorrect info
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <h3 className="font-display text-lg font-bold">Contact</h3>
              <ul className="mt-4 space-y-3 text-sm">
                {business.phone && (
                  <li className="flex items-center gap-3"><Phone className="h-4 w-4 text-primary" /><a href={`tel:${business.phone}`} className="hover:underline">{business.phone}</a></li>
                )}
                {business.email && (
                  <li className="flex items-center gap-3"><Mail className="h-4 w-4 text-primary" /><a href={`mailto:${business.email}`} className="hover:underline">{business.email}</a></li>
                )}
                {business.website && (
                  <li className="flex items-center gap-3"><Globe className="h-4 w-4 text-primary" /><a href={business.website} target="_blank" rel="noopener noreferrer" className="hover:underline">Website</a></li>
                )}
                {business.facebook && (
                  <li className="flex items-center gap-3"><Facebook className="h-4 w-4 text-primary" /><a href={business.facebook} className="hover:underline">Facebook</a></li>
                )}
                {business.instagram && (
                  <li className="flex items-center gap-3"><Instagram className="h-4 w-4 text-primary" /><a href={business.instagram} className="hover:underline">Instagram</a></li>
                )}
                <li className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 text-primary" /><span>{business.address}</span></li>
              </ul>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <h3 className="flex items-center gap-2 font-display text-lg font-bold">
                <Clock className="h-5 w-5 text-primary" /> Opening hours
              </h3>
              <dl className="mt-4 space-y-2 text-sm">
                {(["mon","tue","wed","thu","fri","sat","sun"] as const).map((d) => (
                  <div key={d} className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">{dayLabels[d]}</dt>
                    <dd className="font-medium">{business.openingHours[d] ?? "Closed"}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="font-display text-2xl font-bold">More like this</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((b) => <BusinessCard key={b.id} business={b} />)}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default BusinessProfile;
