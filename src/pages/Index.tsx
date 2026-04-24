import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Layout } from "@/components/Layout";
import { SearchBar } from "@/components/SearchBar";
import { FeaturedCategoryCard } from "@/components/FeaturedCategoryCard";
import { BusinessCard } from "@/components/BusinessCard";
import { ExploreCoast } from "@/components/ExploreCoast";
import { RevealCard } from "@/components/RevealCard";
import { CATEGORIES } from "@/data/categories";
import { useBusinesses } from "@/data/businessStore";
import catResorts from "@/assets/cat-resorts.jpg";
import catRestaurants from "@/assets/cat-restaurants.jpg";
import catTours from "@/assets/cat-tours.jpg";
import catTransport from "@/assets/cat-transport.jpg";
import heroImage from "@/assets/hero-san-vicente.jpg";
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
      style={{ height: "80px" }}
      className="mx-auto mb-6 w-auto drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
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
  const featured = visible.filter((b) => b.isFeatured).slice(0, 8);
  const recent = [...visible].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);
  const totalListings = visible.length;

  const counts = CATEGORIES.reduce<Record<string, number>>((acc, c) => {
    acc[c.slug] = visible.filter((b) => b.category === c.slug).length;
    return acc;
  }, {});

  return (
    <Layout>
      {/* HERO — full-bleed cinematic photo */}
      <section
        className="relative w-full overflow-hidden"
        style={{ minHeight: "70vh" }}
      >
        <div className="absolute inset-0 md:min-h-[90vh]">
          <img
            src={heroImage}
            alt="Long Beach San Vicente Palawan at sunset"
            className="h-full w-full object-cover"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.65) 100%)",
            }}
          />
        </div>

        <div className="relative flex min-h-[70vh] items-center justify-center md:min-h-[90vh]">
          <div className="container px-4 py-16 text-center text-white md:py-24">
            <HeroLogo />

            <h1 className="font-bold leading-[1.02] text-white text-balance [text-shadow:0_2px_24px_rgba(0,0,0,0.45)]">
              <span className="block text-[3.25rem] tracking-[-0.02em] md:text-[5rem]">
                San Vicente
              </span>
              <span className="mt-1 block text-[1.5rem] italic font-semibold md:text-[2rem]" style={{ color: "#10B981" }}>
                slowly.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-[600px] text-base leading-relaxed text-white/85 md:text-[1.1rem]">
              A locally curated directory of resorts, restaurants, tours, and hidden gems along Palawan's legendary 14-km Long Beach.
            </p>

            <div className="mx-auto mt-8 w-full max-w-[600px]">
              <SearchBar variant="hero-dark" />
            </div>

            {/* Stats — white text, white/30 dividers */}
            <dl className="mx-auto mt-10 flex max-w-2xl items-center justify-center divide-x divide-white/30">
              <div className="flex-1 px-4">
                <dd className="text-2xl font-bold text-white md:text-3xl">{totalListings}+</dd>
                <dt className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/70">Listings</dt>
              </div>
              <div className="flex-1 px-4">
                <dd className="text-2xl font-bold text-white md:text-3xl">{CATEGORIES.length}</dd>
                <dt className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/70">Categories</dt>
              </div>
              <div className="flex-1 px-4">
                <dd className="text-2xl font-bold text-white md:text-3xl">14km</dd>
                <dt className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/70">Long Beach</dt>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* CATEGORIES — 1/2/4 grid, 24px gap */}
      <section className="container px-4 py-12 md:py-[80px]">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Browse</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-balance md:text-4xl">Find what you need</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* FEATURED — horizontal carousel on mobile, grid on desktop */}
      <section className="border-t border-border bg-secondary/30">
        <div className="container px-4 py-12 md:py-[80px]">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Featured</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-balance md:text-4xl">Featured listings</h2>
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

          {/* Snap-scroll rail (mobile carousel; desktop shows multiple) */}
          <div className="-mx-4 px-4">
            <div className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4">
              {featured.map((b, i) => (
                <div
                  key={b.id}
                  className="snap-start shrink-0 basis-[85%] sm:basis-[45%] md:basis-[32%] lg:basis-[24%]"
                >
                  <BusinessCard business={b} priority={i < 3} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* EXPLORE THE COAST — interactive map */}
      <ExploreCoast businesses={visible} />


      <section className="container px-4 py-12 md:py-[80px]">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Fresh</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-balance md:text-4xl">Recently added</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {recent.map((b) => (
            <BusinessCard key={b.id} business={b} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container px-4 pb-16 md:pb-[80px]">
        <div className="relative overflow-hidden rounded-3xl gradient-ocean p-8 text-primary-foreground shadow-elegant md:p-14">
          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">
              Own a business in San Vicente?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-primary-foreground/85">
              Get discovered by thousands of travelers. List your business for free and reach the right audience.
            </p>
            <Link
              to="/list-your-business"
              className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-7 font-semibold text-primary shadow-soft transition-smooth hover:scale-[1.02]"
            >
              List your business <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
        </div>
      </section>
    </Layout>
  );
};

export default Index;
