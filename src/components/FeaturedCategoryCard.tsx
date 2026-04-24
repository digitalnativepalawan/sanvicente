import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

interface Props {
  to: string;
  label: string;
  count: number;
  image: string;
}

export const FeaturedCategoryCard = ({ to, label, count, image }: Props) => {
  return (
    <Link
      to={to}
      className="group relative block aspect-[4/5] overflow-hidden rounded-2xl shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card sm:aspect-square"
      style={{ borderRadius: "16px" }}
    >
      <img
        src={image}
        alt={label}
        loading="lazy"
        width={800}
        height={800}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

      {/* Count badge chip */}
      <span className="absolute right-3 top-3 inline-flex items-center rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-foreground shadow-soft backdrop-blur">
        {count} {count === 1 ? "listing" : "listings"}
      </span>

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
        <div>
          <h3 className="font-display text-xl font-bold text-white drop-shadow-md md:text-2xl">
            {label}
          </h3>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/15 text-white backdrop-blur-md transition-transform group-hover:translate-x-0.5 group-hover:bg-white group-hover:text-foreground">
          <ArrowUpRight className="h-5 w-5" />
        </span>
      </div>
    </Link>
  );
};
