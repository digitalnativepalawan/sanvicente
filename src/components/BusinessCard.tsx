import { Link } from "react-router-dom";
import { Heart, Star, BadgeCheck } from "lucide-react";
import fallbackImage from "@/assets/biz-resort.jpg";
import type { Business } from "@/types/business";
import { useFavorites } from "@/hooks/use-favorites";
import { CATEGORIES } from "@/data/categories";
import { getBusinessImage } from "@/lib/business-image";
import { useHoverStore } from "@/hooks/use-hover-store";

interface Props {
  business: Business;
  priority?: boolean;
}

/**
 * Standard directory card — Airbnb-style vertical stack.
 * Image (4:3, rounded-xl, subtle border) on top, content below.
 * Title · category·barangay · price range. Rating pill top-right on image.
 */
export const BusinessCard = ({ business, priority }: Props) => {
  const { has, toggle } = useFavorites();
  const fav = has(business.id);
  const cat = CATEGORIES.find((c) => c.slug === business.category);
  const hasRating = business.rating > 0;
  const setHovered = useHoverStore((s) => s.setHovered);

  return (
    <Link
      to={`/business/${business.slug}`}
      aria-label={`View ${business.name}`}
      onMouseEnter={() => setHovered(business.id)}
      onMouseLeave={() => setHovered(null)}
      onFocus={() => setHovered(business.id)}
      onBlur={() => setHovered(null)}
      className="group flex h-full flex-col"
    >
      {/* Image — fixed 4:3, rounded-xl, 1px border */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-muted">
        <img
          src={getBusinessImage(business)}
          alt={business.name}
          loading={priority ? "eager" : "lazy"}
          width={1280}
          height={960}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          onError={(event) => {
            const img = event.currentTarget;
            if (img.dataset.fallbackApplied === "true") return;
            img.dataset.fallbackApplied = "true";
            img.src = fallbackImage;
          }}
        />

        {hasRating && (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {business.rating.toFixed(1)}
          </span>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle(business.id);
          }}
          aria-label={fav ? "Remove from favorites" : "Add to favorites"}
          className="absolute left-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/85 backdrop-blur-sm transition-colors hover:bg-white"
        >
          <Heart className={`h-4 w-4 ${fav ? "fill-primary text-primary" : "text-foreground"}`} />
        </button>

        {business.isFeatured && (
          <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground backdrop-blur-sm">
            Featured
          </span>
        )}
      </div>

      {/* Content — clean vertical stack */}
      <div className="mt-3 flex flex-col gap-1">
        <div className="flex items-start gap-1.5">
          <h3 className="flex-1 text-base font-semibold leading-snug text-foreground line-clamp-1 group-hover:text-primary">
            {business.name}
          </h3>
          {business.isVerified && (
            <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-label="Verified" />
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-1">
          {cat?.label ?? business.category} · {business.barangay || "San Vicente"}
        </p>
        <p className="text-sm font-medium text-foreground">{business.priceRange}</p>
      </div>
    </Link>
  );
};
