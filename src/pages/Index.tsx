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
  const [scrollY, setScrollY] = useState(0);

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

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
      {/* HERO — full-bleed cinematic photo with parallax. Extends behind the transparent header. */}
      <section
        className="relative -mt-20 w-full overflow-hidden md:-mt-24"
        style={{ minHeight: "70vh" }}
      >
        <div className="absolute inset-0 md:min-h-[100vh]">
          <img
            src={heroImage}
            alt="Long Beach San Vicente Palawan at sunset"
            className="h-[120%] w-full object-cover will-change-transform"
            style={{ transform: `translate3d(0, ${scrollY * 0.35}px, 0) scale(1.05)` }}
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.25) 35%, rgba(0,0,0,0.75) 100%)",
            }}
          />
        </div>

        <div className="relative flex min-h-[90vh] items-center justify-center md:min-h-[100vh]">
          <div className="container px-4 pb-20 pt-32 text-center text-white md:pb-28 md:pt-40">
            <HeroLogo />

            <h1 className="font-black leading-[0.95] text-white text-balance tracking-tighter [text-shadow:0_2px_28px_rgba(0,0,0,0.5)]">
              <span className="block text-6xl md:text-[6rem] lg:text-[7rem]">
                San Vicente
              </span>
              <span
                className="mt-2 block text-2xl italic font-semibold md:text-[2.25rem]"
                style={{ color: "hsl(var(--primary))" }}
              >
                slowly.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-[600px] text-base leading-relaxed text-white/85 md:text-[1.1rem]">
              A locally curated directory of resorts, restaurants, tours, and hidden gems along Palawan's legendary 14-km Long Beach.
            </p>

            {/* Floating glass search card with high-elevation shadow */}
            <div className="mx-auto mt-10 w-full max-w-[640px]">
              <SearchBar variant="hero-dark" />
            </div>

            {/* Stats */}
            <dl className="mx-auto mt-12 flex max-w-2xl items-center justify-center divide-x divide-white/30">
              <div className="flex-1 px-4">
                <dd className="text-3xl font-black tracking-tight text-white md:text-4xl">{totalListings}+</dd>
                <dt className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/70">Listings</dt>
              </div>
              <div className="flex-1 px-4">
                <dd className="text-3xl font-black tracking-tight text-white md:text-4xl">{CATEGORIES.length}</dd>
                <dt className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/70">Categories</dt>
              </div>
              <div className="flex-1 px-4">
                <dd className="text-3xl font-black tracking-tight text-white md:text-4xl">14km</dd>
                <dt className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/70">Long Beach</dt>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* CATEGORIES — spacious gutters, staggered reveal */}
      <section className="container px-4 py-16 md:py-[100px]">
        <div className="mb-12 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Browse</p>
            <h2 className="mt-2 text-4xl font-black tracking-tighter text-balance md:text-5xl">Find what you need</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED_CATEGORY_ORDER
            .map((slug) => CATEGORIES.find((c) => c.slug === slug))
            .filter((c): c is NonNullable<typeof c> => !!c && (counts[c.slug] ?? 0) > 0)
            .map((c, i) => (
              <RevealCard key={c.slug} delayMs={i * 90}>
                <FeaturedCategoryCard
                  to={`/category/${c.slug}`}
                  label={c.label}
                  count={counts[c.slug] ?? 0}
                  image={categoryImages[c.slug] || FEATURED_CATEGORY_IMAGES[c.slug]}
                />
              </RevealCard>
            ))}
        </div>
      </section>

      {/* FEATURED — Bento grid (featured items span 2 cols, others span 1) */}
      <section className="border-y border-border bg-sand/40">
        <div className="container px-4 py-16 md:py-[100px]">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Featured</p>
              <h2 className="mt-2 text-4xl font-black tracking-tighter text-balance md:text-5xl">Featured listings</h2>
              <p className="mt-3 max-w-md text-muted-foreground">
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

          {/* Bento grid — first item spans 2 cols on lg, rest span 1. Total 6 cells across 4 cols. */}
          <div className="grid auto-rows-[1fr] grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {featured.slice(0, 7).map((b, i) => {
              // Featured items in positions 0 and 5 span 2 columns on lg
              const span2 = i === 0 || i === 5;
              return (
                <RevealCard
                  key={b.id}
                  delayMs={i * 80}
                  className={span2 ? "lg:col-span-2" : ""}
                >
                  <BusinessCard business={b} priority={i < 3} />
                </RevealCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* EXPLORE THE COAST — interactive map */}
      <ExploreCoast businesses={visible} />

      <section className="container px-4 py-16 md:py-[100px]">
        <div className="mb-12 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Fresh</p>
            <h2 className="mt-2 text-4xl font-black tracking-tighter text-balance md:text-5xl">Recently added</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {recent.map((b, i) => (
            <RevealCard key={b.id} delayMs={i * 80}>
              <BusinessCard business={b} />
            </RevealCard>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container px-4 pb-20 md:pb-[100px]">
        <div className="relative overflow-hidden rounded-[2rem] gradient-ocean p-8 text-primary-foreground shadow-elegant md:p-16">
          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-black tracking-tighter text-balance md:text-5xl">
              Own a business in San Vicente?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-primary-foreground/85">
              Get discovered by thousands of travelers. List your business for free and reach the right audience.
            </p>
            <Link
              to="/list-your-business"
              className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-7 font-semibold text-primary shadow-soft transition-smooth hover:scale-[1.02]"
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
