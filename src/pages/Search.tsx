import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { X } from "lucide-react";
import { Layout } from "@/components/Layout";
import { SearchBar } from "@/components/SearchBar";
import { BusinessCard } from "@/components/BusinessCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBusinesses } from "@/data/businessStore";
import { CATEGORIES } from "@/data/categories";
import type { Category } from "@/types/business";

const SearchPage = () => {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const [activeCat, setActiveCat] = useState<Category | "all">("all");

  useEffect(() => {
    document.title = q ? `“${q}” – San Vicente Directory` : "Search – San Vicente Directory";
  }, [q]);

  const all = useBusinesses();
  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all.filter((b) => {
      if (!b.isActive) return false;
      if (activeCat !== "all" && b.category !== activeCat) return false;
      if (!needle) return true;
      return (
        b.name.toLowerCase().includes(needle) ||
        b.description.toLowerCase().includes(needle) ||
        b.shortDescription.toLowerCase().includes(needle) ||
        b.category.includes(needle) ||
        b.barangay.toLowerCase().includes(needle) ||
        b.services.some((s) => s.toLowerCase().includes(needle)) ||
        b.amenities.some((a) => a.toLowerCase().includes(needle))
      );
    });
  }, [q, activeCat, all]);

  const clearQuery = () => setParams({});

  return (
    <Layout>
      <section className="border-b border-border/60 bg-secondary/40">
        <div className="container px-4 py-10 md:py-14">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">Search</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-balance md:text-4xl">
            {q ? <>Results for <span className="italic">“{q}”</span></> : "Find a local business"}
          </h1>

          <div className="mt-5 max-w-2xl">
            <SearchBar variant="hero" defaultValue={q} />
          </div>

          {/* Filters */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {q && (
              <Badge variant="outline" className="gap-1 rounded-full px-3 py-1.5">
                {q}
                <button onClick={clearQuery} aria-label="Clear search">
                  <X className="h-3.5 w-3.5" />
                </button>
              </Badge>
            )}
            <button
              type="button"
              onClick={() => setActiveCat("all")}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-smooth ${
                activeCat === "all" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => setActiveCat(c.slug)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-smooth ${
                  activeCat === c.slug ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="container px-4 py-10">
        <p className="mb-6 text-sm text-muted-foreground">{results.length} result{results.length === 1 ? "" : "s"}</p>

        {results.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
            <h2 className="font-display text-xl font-bold">No results found</h2>
            <p className="mt-2 text-muted-foreground">Try a different keyword or browse a category below.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {CATEGORIES.slice(0, 4).map((c) => (
                <Button key={c.slug} variant="outline" onClick={() => { setActiveCat(c.slug); setParams({}); }}>
                  {c.label}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((b, i) => (
              <BusinessCard key={b.id} business={b} priority={i < 3} />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default SearchPage;
