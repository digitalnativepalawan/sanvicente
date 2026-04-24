import { Link, useNavigate } from "react-router-dom";
import { Map as MapIcon, Menu, Plus, Search, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/data/categories";
import { useSiteSettings } from "@/hooks/use-site-settings";

export const Header = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { settings } = useSiteSettings();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/90 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4 px-4 md:h-18">
        <Link to="/" className="flex items-center" aria-label={`${settings.site_name} home`}>
          <img
            src={settings.logo_url}
            alt={`${settings.site_name} logo`}
            style={{ height: `${Math.min(settings.logo_size_header, 40)}px` }}
            className="w-auto max-w-full object-contain"
            loading="eager"
            decoding="async"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {CATEGORIES.slice(0, 5).map((c) => (
            <Link
              key={c.slug}
              to={`/category/${c.slug}`}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {c.label}
            </Link>
          ))}
          <Link
            to="/map"
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <MapIcon className="h-4 w-4" /> Map
          </Link>
        </nav>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/search")}
            aria-label="Search"
            className="h-10 w-10 rounded-md"
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label="Admin"
            className="hidden h-10 w-10 rounded-md sm:inline-flex"
          >
            <Link to="/admin"><ShieldCheck className="h-5 w-5" /></Link>
          </Button>
          <Button
            asChild
            className="hidden h-10 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 md:inline-flex"
          >
            <Link to="/list-your-business">
              <Plus className="mr-1 h-4 w-4" /> List business
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-md md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="container flex flex-col gap-1 px-4 py-3">
            {CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                to={`/category/${c.slug}`}
                onClick={() => setOpen(false)}
                className="rounded-md px-4 py-3 text-base font-medium hover:bg-secondary"
              >
                {c.label}
              </Link>
            ))}
            <Link
              to="/map"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-4 py-3 text-base font-medium hover:bg-secondary"
            >
              <MapIcon className="h-4 w-4" /> Map
            </Link>
            <Link
              to="/list-your-business"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-base font-semibold text-primary-foreground"
            >
              <Plus className="h-4 w-4" /> List your business
            </Link>
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-4 py-3 text-base font-medium text-muted-foreground hover:bg-secondary"
            >
              <ShieldCheck className="h-4 w-4" /> Admin
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
