import { Link } from "react-router-dom";
import * as Icons from "lucide-react";
import type { CategoryMeta } from "@/types/business";

interface Props {
  category: CategoryMeta;
  count: number;
}

export const CategoryCard = ({ category, count }: Props) => {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[category.icon] ?? Icons.Circle;

  return (
    <Link
      to={`/category/${category.slug}`}
      className="group relative flex flex-col items-start gap-3 overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-soft transition-smooth hover:-translate-y-1 hover:border-primary/30 hover:shadow-card md:p-6"
    >
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-soft text-accent transition-smooth group-hover:scale-110 md:h-14 md:w-14">
        <Icon className="h-6 w-6 md:h-7 md:w-7" />
      </span>
      <div className="space-y-1">
        <h3 className="font-display text-base font-bold md:text-lg">{category.label}</h3>
        <p className="text-xs text-muted-foreground md:text-sm">{count} listings</p>
      </div>
      <span className="absolute right-5 top-5 text-muted-foreground transition-smooth group-hover:translate-x-1 group-hover:text-primary">
        <Icons.ArrowUpRight className="h-5 w-5" />
      </span>
    </Link>
  );
};
