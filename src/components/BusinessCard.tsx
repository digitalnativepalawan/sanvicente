import { Link } from "react-router-dom";
import { Heart, Star, BadgeCheck, ArrowRight, MapPin, Wallet, Sparkles } from "lucide-react";
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
    <article className="group relative flex h-full flex-col gap-4">
      {/* Floating image — borderless, large radius, soft expanding shadow */}
      <Link
        to={`/business/${business.slug}`}
        className="relative block aspect-[4/3] overflow-hidden rounded-[2.5rem] bg-muted shadow-float transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1 shadow-float-hover"
      >
        <img
          src={getBusinessImage(business)}
          alt={business.name}
          loading={priority ? "eager" : "lazy"}
          width={1280}
          height={960}
          className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
          onError={(event) => {
            const img = event.currentTarget;
            if (img.dataset.fallbackApplied === "true") return;
            img.dataset.fallbackApplied = "true";
            img.src = fallbackImage;
          }}
        />

        {catColor && (
          <span
            className="absolute left-4 top-4 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow-soft backdrop-blur-sm"
            style={{ backgroundColor: `${catColor.hex}E6` }}
          >
            {catColor.label}
          </span>
        )}

        {business.isFeatured && (
          <span className="absolute right-16 top-4 inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-md">
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
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/85 backdrop-blur-md ring-1 ring-white/60 transition-smooth hover:bg-white"
        >
          <Heart className={`h-4 w-4 ${fav ? "fill-primary text-primary" : "text-foreground"}`} />
        </button>
      </Link>

      {/* Text directly on the page background — no card shell */}
      <div className="flex flex-1 flex-col gap-2 px-1">
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

        {/* Vertical Quick Info — Price · Location · Features */}
        <ul className="mt-1 space-y-1.5 text-[13px] text-foreground/85">
          <li className="flex items-center gap-2">
            <Wallet className="h-3.5 w-3.5 shrink-0 text-primary/80" aria-hidden />
            <span className="truncate">
              <span className="font-semibold text-foreground">{business.priceRange}</span>
              <span className="text-muted-foreground"> · {priceLabel(business.priceRange).split(" — ")[0]}</span>
            </span>
          </li>
          <li className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/80" aria-hidden />
            <span className="truncate text-muted-foreground">{business.barangay || "San Vicente"}</span>
          </li>
          {business.amenities && business.amenities.length > 0 && (
            <li className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/80" aria-hidden />
              <span className="line-clamp-1 text-muted-foreground">
                {business.amenities.slice(0, 3).join(" · ")}
              </span>
            </li>
          )}
        </ul>

        <Link
          to={`/business/${business.slug}`}
          className="mt-auto inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full border border-border bg-background text-sm font-semibold text-foreground transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-primary hover:bg-primary hover:text-primary-foreground"
        >
          View Details <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
};
