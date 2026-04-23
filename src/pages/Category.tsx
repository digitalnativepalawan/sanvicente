import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, SlidersHorizontal } from "lucide-react";
import { Layout } from "@/components/Layout";
import { BusinessCard } from "@/components/BusinessCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, getCategory } from "@/data/categories";
import { useBusinesses } from "@/data/businessStore";

type SortKey = "featured" | "rating" | "name" | "newest";

const Category = () => {
  const { slug = "" } = useParams();
  const cat = getCategory(slug);
  const [sort, setSort] = useState<SortKey>("featured");
  const [priceFilter, setPriceFilter] = useState<string>("all");

  useEffect(() => {
    if (cat) {
      document.title = `${cat.label} in San Vicente, Palawan | Directory`;
    }
  }, [cat]);

  const businesses = useMemo(() => {
    if (!cat) return [];
    let list = getBusinessesByCategory(slug);
    if (priceFilter !== "all") list = list.filter((b) => b.priceRange === priceFilter);
    list = [...list].sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "newest") return b.createdAt.localeCompare(a.createdAt);
      return Number(b.isFeatured) - Number(a.isFeatured);
    });
    return list;
  }, [cat, slug, sort, priceFilter]);

  if (!cat) {
    return (
      <Layout>
        <div className="container px-4 py-24 text-center">
          <h1 className="font-display text-3xl font-bold">Category not found</h1>
          <Link to="/" className="mt-4 inline-block text-primary hover:underline">Back home</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <section className="border-b border-border/60 bg-secondary/40">
        <div className="container px-4 py-10 md:py-14">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" /> All categories
          </Link>
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-accent">Category</p>
              <h1 className="mt-2 font-display text-4xl font-bold text-balance md:text-5xl">{cat.label}</h1>
              <p className="mt-3 text-muted-foreground">{cat.description}</p>
            </div>
            <p className="text-sm text-muted-foreground">{businesses.length} listings</p>
          </div>
        </div>
      </section>

      <section className="container px-4 py-8 md:py-12">
        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <SlidersHorizontal className="h-4 w-4" /> Filter
          </span>
          <Select value={priceFilter} onValueChange={setPriceFilter}>
            <SelectTrigger className="h-11 w-auto min-w-[140px] rounded-full">
              <SelectValue placeholder="Price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All prices</SelectItem>
              <SelectItem value="₱">₱ Budget</SelectItem>
              <SelectItem value="₱₱">₱₱ Mid-range</SelectItem>
              <SelectItem value="₱₱₱">₱₱₱ Upscale</SelectItem>
              <SelectItem value="₱₱₱₱">₱₱₱₱ Luxury</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="h-11 w-auto min-w-[160px] rounded-full">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured first</SelectItem>
              <SelectItem value="rating">Highest rated</SelectItem>
              <SelectItem value="name">Alphabetical</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        {businesses.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">No listings match these filters.</p>
            <Button variant="ghost" className="mt-4" onClick={() => setPriceFilter("all")}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {businesses.map((b, i) => (
              <BusinessCard key={b.id} business={b} priority={i < 3} />
            ))}
          </div>
        )}

        {/* Other categories */}
        <div className="mt-16">
          <h2 className="font-display text-xl font-bold">Explore other categories</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {CATEGORIES.filter((c) => c.slug !== slug).map((c) => (
              <Link
                key={c.slug}
                to={`/category/${c.slug}`}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:border-primary/40 hover:text-primary"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Category;
