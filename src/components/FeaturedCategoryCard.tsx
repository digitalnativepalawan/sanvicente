import { Link } from "react-router-dom";

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
      className="group relative block aspect-[4/5] overflow-hidden rounded-3xl border border-border transition-all duration-500 hover:-translate-y-1.5 hover:border-primary hover:shadow-elegant sm:aspect-square"
    >
      <img
        src={image}
        alt={label}
        loading="lazy"
        width={800}
        height={800}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

      {/* Count badge — top right */}
      <span className="absolute right-3 top-3 inline-flex items-center rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-foreground shadow-soft backdrop-blur">
        {count} {count === 1 ? "listing" : "listings"}
      </span>

      {/* Category name — bottom */}
      <div className="absolute inset-x-0 bottom-0 p-5">
        <h3 className="text-xl font-bold text-white drop-shadow-md md:text-2xl">
          {label}
        </h3>
      </div>
    </Link>
  );
};
