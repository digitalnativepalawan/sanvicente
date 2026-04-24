import { Link } from "react-router-dom";
import { Heart, MapPin, Star, BadgeCheck } from "lucide-react";
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
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-card">
      <Link to={`/business/${business.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={getBusinessImage(business)}
          alt={business.name}
          loading={priority ? "eager" : "lazy"}
          width={1280}
          height={896}
          className="h-full w-full object-cover transition-smooth duration-500 group-hover:scale-105"
        />
        {business.isFeatured && (
          <Badge className="absolute left-3 top-3 rounded-full border-0 gradient-sunset px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-foreground shadow-soft">
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
          className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full bg-background/85 backdrop-blur transition-smooth hover:bg-background"
        >
          <Heart className={`h-5 w-5 ${fav ? "fill-accent text-accent" : "text-foreground"}`} />
        </button>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="font-medium uppercase tracking-wider text-primary">{cat?.label.split(" ")[0]}</span>
          <span className="text-muted-foreground">{business.priceRange}</span>
        </div>

        <Link to={`/business/${business.slug}`} className="space-y-1">
          <h3 className="flex items-start gap-1.5 font-display text-lg font-bold leading-tight text-balance">
            {business.name}
            {business.isVerified && (
              <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-label="Verified" />
            )}
          </h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">{business.shortDescription}</p>
        </Link>

        <div className="mt-auto flex items-center justify-between gap-3 pt-2 text-sm">
          <span className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-4 w-4" aria-hidden />
            <span className="truncate">{business.barangay}</span>
          </span>
          <span className="flex items-center gap-1 font-semibold">
            <Star className="h-4 w-4 fill-accent text-accent" aria-hidden />
            {business.rating.toFixed(1)}
            <span className="font-normal text-muted-foreground">({business.reviewCount})</span>
          </span>
        </div>
      </div>
    </article>
  );
};
