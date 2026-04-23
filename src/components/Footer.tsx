import { Link } from "react-router-dom";
import { CATEGORIES } from "@/data/categories";

export const Footer = () => {
  return (
    <footer className="border-t border-border/60 bg-secondary/30">
      <div className="container px-4 py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-full gradient-ocean text-primary-foreground">
                SV
              </span>
              <span className="font-display text-lg font-bold">San Vicente Directory</span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              Your local guide to the resorts, restaurants, tours, and hidden gems of San Vicente, Palawan — home of the legendary 14-km Long Beach.
            </p>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider">Categories</h3>
            <ul className="mt-4 space-y-2">
              {CATEGORIES.slice(0, 4).map((c) => (
                <li key={c.slug}>
                  <Link to={`/category/${c.slug}`} className="text-sm text-muted-foreground hover:text-foreground">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider">Directory</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/search" className="text-sm text-muted-foreground hover:text-foreground">Search</Link></li>
              <li><Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Featured</Link></li>
              <li><span className="text-sm text-muted-foreground">List your business</span></li>
              <li><span className="text-sm text-muted-foreground">About</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} San Vicente Directory. Made with care in Palawan.</p>
          <p>A community-built directory for travelers and locals.</p>
        </div>
      </div>
    </footer>
  );
};
