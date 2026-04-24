import { Link } from "react-router-dom";
import { Heart, Star, BadgeCheck, ArrowRight } from "lucide-react";
import fallbackImage from "@/assets/biz-resort.jpg";
import type { Business } from "@/types/business";
import { useFavorites } from "@/hooks/use-favorites";
import { CATEGORIES } from "@/data/categories";
import { getBusinessImage } from "@/lib/business-image";
import { CATEGORY_COLORS } from "@/lib/category-colors";
import { priceLabel } from "@/lib/price-range";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  business: Business;
  priority?: boolean;
}

export const BusinessCard = ({ business, priority }: Props) => {
  const { has, toggle } = useFavorites();
  const fav = has(business.id);
  const cat = CATEGORIES.find((c) => c.slug === business.category);
  const catColor = CATEGORY_COLORS[business.category];
  const hasRating = business.rating > 0;

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-elegant"
    >
      {/* 16:9 image */}
      <Link
        to={`/business/${business.slug}`}
        className="relative block aspect-video overflow-hidden bg-muted"
      >
        <img
          src={getBusinessImage(business)}
          alt={business.name}
          loading={priority ? "eager" : "lazy"}
          width={1280}
          height={720}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          onError={(event) => {
            const img = event.currentTarget;
            if (img.dataset.fallbackApplied === "true") return;
            img.dataset.fallbackApplied = "true";
            img.src = fallbackImage;
          }}
        />

        {/* Category badge — top left, colored to match map pins */}
        {catColor && (
          <span
            className="absolute left-3 top-3 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow-soft"
            style={{ backgroundColor: catColor.hex }}
          >
            {catColor.label}
          </span>
        )}

        {/* Featured badge — top right (smaller, dark) */}
        {business.isFeatured && (
          <span className="absolute right-14 top-3 inline-flex items-center gap-1 rounded-full bg-black/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            Featured
          </span>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggle(business.id);
          }}
          aria-label={fav ? "Remove from favorites" : "Add to favorites"}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/90 backdrop-blur transition-smooth hover:bg-background"
        >
          <Heart className={`h-4 w-4 ${fav ? "fill-primary text-primary" : "text-foreground"}`} />
        </button>
      </Link>

      <div className="flex flex-1 flex-col gap-2.5 p-5">
        {/* Title + price row */}
        <div className="flex items-start justify-between gap-3">
          <Link
            to={`/business/${business.slug}`}
            className="flex items-start gap-1.5 text-[18px] font-bold leading-tight text-foreground transition-smooth hover:text-primary"
          >
            <span className="line-clamp-1">{business.name}</span>
            {business.isVerified && (
              <Tooltip delayDuration={150}>
                <TooltipTrigger asChild>
                  <span className="mt-0.5 inline-flex shrink-0">
                    <BadgeCheck className="h-4 w-4 text-primary" aria-label="Verified" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[220px] text-xs">
                  Verified by our San Vicente team — we've personally visited this place.
                </TooltipContent>
              </Tooltip>
            )}
          </Link>

          <Tooltip delayDuration={150}>
            <TooltipTrigger asChild>
              <span className="shrink-0 cursor-help text-sm font-bold text-orange-500">
                {business.priceRange}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {priceLabel(business.priceRange)}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Rating row — only if rated */}
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
            {cat?.label.split(" ")[0] ?? business.category}
          </span>
          {hasRating ? (
            <span className="flex items-center gap-1 font-medium">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" aria-hidden />
              {business.rating.toFixed(1)}
              <span className="font-normal text-muted-foreground">({business.reviewCount})</span>
            </span>
          ) : (
            <span className="text-xs italic text-muted-foreground/80">Be the first to review</span>
          )}
        </div>

        {/* Description */}
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {business.shortDescription}
        </p>

        <Link
          to={`/business/${business.slug}`}
          className="mt-auto inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full border border-border bg-background text-sm font-semibold text-foreground transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground"
        >
          View Details <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
};
