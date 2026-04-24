import { Link } from "react-router-dom";
import { Heart, Star, BadgeCheck, ArrowRight } from "lucide-react";
import fallbackImage from "@/assets/biz-resort.jpg";
import type { Business } from "@/types/business";
import { useFavorites } from "@/hooks/use-favorites";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "@/data/categories";
import { getBusinessImage } from "@/lib/business-image";

interface Props {
  business: Business;
  priority?: boolean;
}

export const BusinessCard = ({ business, priority }: Props) => {
  const { has, toggle } = useFavorites();
  const fav = has(business.id);
  const cat = CATEGORIES.find((c) => c.slug === business.category);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-glow">
      {/* 16:9 full-bleed image, no padding */}
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
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(event) => {
            const img = event.currentTarget;
            if (img.dataset.fallbackApplied === "true") return;
            img.dataset.fallbackApplied = "true";
            img.src = fallbackImage;
          }}
        />
        {business.isFeatured && (
          <Badge className="absolute left-3 top-3 rounded-full border-0 bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground shadow-soft">
            Featured
          </Badge>
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
        {/* Title (18px bold) + price on same row */}
        <div className="flex items-start justify-between gap-3">
          <Link
            to={`/business/${business.slug}`}
            className="flex items-start gap-1.5 text-[18px] font-bold leading-tight text-foreground hover:text-primary transition-smooth"
          >
            <span className="line-clamp-1">{business.name}</span>
            {business.isVerified && (
              <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-label="Verified" />
            )}
          </Link>
          <span className="shrink-0 text-sm font-semibold text-foreground">{business.priceRange}</span>
        </div>

        {/* Category tag + rating */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
            {cat?.label.split(" ")[0] ?? business.category}
          </span>
          <span className="flex items-center gap-1 text-sm font-medium">
            <Star className="h-4 w-4 fill-primary text-primary" aria-hidden />
            {business.rating.toFixed(1)}
            <span className="font-normal text-muted-foreground">({business.reviewCount})</span>
          </span>
        </div>

        {/* 2-line clamped description */}
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {business.shortDescription}
        </p>

        {/* View Details — outline → solid on hover */}
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
