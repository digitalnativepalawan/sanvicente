import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { Layout } from "@/components/Layout";
import { SearchBar } from "@/components/SearchBar";
import { FeaturedCategoryCard } from "@/components/FeaturedCategoryCard";
import { BusinessCard } from "@/components/BusinessCard";
import { CATEGORIES } from "@/data/categories";
import { useBusinesses } from "@/data/businessStore";
import hero from "@/assets/hero-sanvicente.jpg";
import catResorts from "@/assets/cat-resorts.jpg";
import catRestaurants from "@/assets/cat-restaurants.jpg";
import catTours from "@/assets/cat-tours.jpg";
import catTransport from "@/assets/cat-transport.jpg";
import { useSiteSettings } from "@/hooks/use-site-settings";

const FEATURED_CATEGORY_IMAGES: Record<string, string> = {
  resorts: catResorts,
  restaurants: catRestaurants,
  tours: catTours,
  transport: catTransport,
};
const FEATURED_CATEGORY_ORDER = ["resorts", "restaurants", "tours", "transport"];

const HeroLogo = () => {
  const { settings } = useSiteSettings();
  return (
    <img
      src={settings.logo_url}
      alt={`${settings.site_name} logo`}
      style={{ height: `${settings.logo_size_hero}px` }}
      className="mx-auto mb-6 w-auto"
      loading="eager"
      decoding="async"
    />
  );
};

const Index = () => {
  useEffect(() => {
    document.title = "San Vicente Palawan Directory | Resorts, Tours & Local Businesses";
    const desc = "Discover the best resorts, restaurants, tours, and local businesses in San Vicente, Palawan — home of the legendary 14-km Long Beach.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);
  }, []);

  const businesses = useBusinesses();
  const { settings } = useSiteSettings();
  const categoryImages = settings.category_images || {};
  const visible = businesses.filter((b) => b.isActive);
  const featured = visible.filter((b) => b.isFeatured).slice(0, 6);
  const recent = [...visible].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);
  const totalListings = visible.length;

  const counts = CATEGORIES.reduce<Record<string, number>>((acc, c) => {
    acc[c.slug] = visible.filter((b) => b.category === c.slug).length;
    return acc;
  }, {});

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={hero}
            alt="Aerial view of Long Beach in San Vicente, Palawan at sunset"
            width={1920}
            height={1280}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 gradient-hero" />
        </div>

        <div className="container relative px-4 py-20 md:py-32 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <HeroLogo />
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-white backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              Palawan, Philippines
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] text-white text-balance md:text-6xl lg:text-7xl">
              Discover San Vicente,<br />
              <span className="italic text-white/95">slowly.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/90 md:text-lg">
              A locally curated directory of resorts, restaurants, tours, and hidden gems along Palawan's legendary 14-km Long Beach.
            </p>

            <div className="mx-auto mt-8 max-w-2xl">
              <SearchBar variant="hero" />
            </div>

            {/* Stats */}
            <dl className="mx-auto mt-10 grid max-w-lg grid-cols-3 gap-4 text-white">
              <div>
                <dt className="text-xs uppercase tracking-wider text-white/70">Listings</dt>
                <dd className="font-display text-2xl font-bold md:text-3xl">{totalListings}+</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-white/70">Categories</dt>
                <dd className="font-display text-2xl font-bold md:text-3xl">{CATEGORIES.length}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-white/70">Long Beach</dt>
                <dd className="font-display text-2xl font-bold md:text-3xl">14km</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="container px-4 py-16 md:py-24">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">Browse</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-balance md:text-4xl">Find what you need</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED_CATEGORY_ORDER
            .map((slug) => CATEGORIES.find((c) => c.slug === slug))
            .filter((c): c is NonNullable<typeof c> => !!c && (counts[c.slug] ?? 0) > 0)
            .map((c) => (
              <FeaturedCategoryCard
                key={c.slug}
                to={`/category/${c.slug}`}
                label={c.label}
                count={counts[c.slug] ?? 0}
                image={categoryImages[c.slug] || FEATURED_CATEGORY_IMAGES[c.slug]}
              />
            ))}
        </div>
      </section>

      {/* Featured */}
      <section className="border-y border-border/60 bg-secondary/30">
        <div className="container px-4 py-16 md:py-24">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-accent">Featured</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-balance md:text-4xl">Loved by travelers</h2>
              <p className="mt-2 max-w-md text-muted-foreground">
                Verified, top-rated places across San Vicente — handpicked by our local team.
              </p>
            </div>
            <Link
              to="/search"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((b, i) => (
              <BusinessCard key={b.id} business={b} priority={i < 3} />
            ))}
          </div>
        </div>
      </section>

      {/* Recently added */}
      <section className="container px-4 py-16 md:py-24">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">Fresh</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-balance md:text-4xl">Recently added</h2>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {recent.map((b) => (
            <BusinessCard key={b.id} business={b} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container px-4 pb-20">
        <div className="relative overflow-hidden rounded-3xl gradient-ocean p-8 text-primary-foreground shadow-elegant md:p-14">
          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-balance md:text-4xl">
              Own a business in San Vicente?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-primary-foreground/85">
              Get discovered by thousands of travelers. List your business for free and reach the right audience.
            </p>
            <Link
              to="/search"
              className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-7 font-semibold text-primary shadow-soft transition-smooth hover:scale-[1.02]"
            >
              List your business <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-primary-glow/40 blur-3xl" />
        </div>
      </section>
    </Layout>
  );
};

export default Index;
