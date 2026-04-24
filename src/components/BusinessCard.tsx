import { Link } from "react-router-dom";
import { Heart, Star, BadgeCheck, MapPin, Wallet, Sparkles } from "lucide-react";
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
  /** When true, the image uses a wide 21:9 aspect ratio (visual anchor) */
  wide?: boolean;
}

/**
 * Spatial / "no-box" listing card.
 * - Entire card is a single Link (whole area is the touch target)
 * - Borderless: image floats with deep soft shadow, text below sits on the page surface
 * - Floating glass title strip overlaps the image bottom edge
 * - Monochromatic icon row replaces the old text feature list
 */
export const BusinessCard = ({ business, priority, wide = false }: Props) => {
  const { has, toggle } = useFavorites();
  const fav = has(business.id);
  const cat = CATEGORIES.find((c) => c.slug === business.category);
  const catColor = CATEGORY_COLORS[business.category];
  const hasRating = business.rating > 0;
  const topAmenity = business.amenities?.[0];

  return (
    <Link
      to={`/business/${business.slug}`}
      aria-label={`View ${business.name}`}
      className="group relative flex h-full flex-col transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 hover:scale-[1.02]"
    >
      {/* Floating image — borderless, large radius, deep soft shadow */}
      <div
        className={`relative overflow-hidden rounded-[2.5rem] bg-muted shadow-[0_22px_70px_4px_rgba(0,0,0,0.07)] transition-shadow duration-500 group-hover:shadow-[0_30px_90px_8px_rgba(0,0,0,0.12)] ${
          wide ? "aspect-[21/9]" : "aspect-[4/3]"
        }`}
      >
        <img
          src={getBusinessImage(business)}
          alt={business.name}
          loading={priority ? "eager" : "lazy"}
          width={wide ? 2100 : 1280}
          height={wide ? 900 : 960}
          className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
          onError={(event) => {
            const img = event.currentTarget;
            if (img.dataset.fallbackApplied === "true") return;
            img.dataset.fallbackApplied = "true";
            img.src = fallbackImage;
          }}
        />

        {/* Subtle bottom gradient so the floating glass card is always readable */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent" />

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

        {/* Favorite — stop propagation so it doesn't trigger the card link */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle(business.id);
          }}
          aria-label={fav ? "Remove from favorites" : "Add to favorites"}
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/85 backdrop-blur-md ring-1 ring-white/60 transition-smooth hover:bg-white"
        >
          <Heart className={`h-4 w-4 ${fav ? "fill-primary text-primary" : "text-foreground"}`} />
        </button>
      </div>

      {/* Floating glass title strip — overlaps image bottom edge */}
      <div className="relative z-10 mx-4 -mt-10 rounded-[1.75rem] border border-white/50 bg-white/70 p-5 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.15)] backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <h3 className="flex items-start gap-1.5 text-[17px] font-bold leading-tight tracking-tight text-foreground text-balance">
            <span className="line-clamp-2">{business.name}</span>
            {business.isVerified && (
              <Tooltip delayDuration={150}>
                <TooltipTrigger asChild>
                  <span
                    className="mt-0.5 inline-flex shrink-0"
                    onClick={(e) => e.preventDefault()}
                  >
                    <BadgeCheck className="h-4 w-4 text-primary" aria-label="Verified" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[220px] text-xs">
                  Verified by our San Vicente team — we've personally visited this place.
                </TooltipContent>
              </Tooltip>
            )}
          </h3>

          {hasRating && (
            <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-foreground">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" aria-hidden />
              {business.rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Category + monochromatic icon row */}
        <div className="mt-3 flex items-center justify-between gap-3 text-[12px] text-muted-foreground">
          <span className="truncate uppercase tracking-[0.12em]">
            {cat?.label.split(" ")[0] ?? business.category}
          </span>

          {/* Minimal monochromatic metadata icons */}
          <div className="flex shrink-0 items-center gap-3">
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <span
                  className="inline-flex items-center gap-1 text-foreground/70"
                  onClick={(e) => e.preventDefault()}
                >
                  <Wallet className="h-3.5 w-3.5" aria-hidden />
                  <span className="font-semibold">{business.priceRange}</span>
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {priceLabel(business.priceRange)}
              </TooltipContent>
            </Tooltip>

            <span className="inline-flex items-center gap-1 text-foreground/70">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              <span className="max-w-[80px] truncate">{business.barangay || "San Vicente"}</span>
            </span>

            {topAmenity && (
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <span
                    className="inline-flex items-center gap-1 text-foreground/70"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Sparkles className="h-3.5 w-3.5" aria-hidden />
                    <span className="max-w-[70px] truncate">{topAmenity}</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {business.amenities.slice(0, 4).join(" · ")}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};
