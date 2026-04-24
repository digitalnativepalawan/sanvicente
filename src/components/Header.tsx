import { Link, useNavigate } from "react-router-dom";
import { Map as MapIcon, Menu, Plus, Search, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/data/categories";
import { useSiteSettings } from "@/hooks/use-site-settings";

export const Header = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { settings } = useSiteSettings();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled || open
          ? "border-b border-border/60 bg-white/70 backdrop-blur-xl shadow-soft"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="container flex h-20 items-center justify-between gap-4 px-4 md:h-24">
        <Link to="/" className="flex items-center" aria-label={`${settings.site_name} home`}>
          <img
            src={settings.logo_url}
            alt={`${settings.site_name} logo`}
            style={{ height: `${settings.logo_size_header}px` }}
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
              className={`rounded-full px-3 py-2 text-sm font-medium transition-smooth ${
                scrolled
                  ? "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  : "text-white/90 hover:bg-white/15 hover:text-white"
              }`}
            >
              {c.label}
            </Link>
          ))}
          <Link
            to="/map"
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-smooth ${
              scrolled
                ? "text-muted-foreground hover:bg-secondary hover:text-foreground"
                : "text-white/90 hover:bg-white/15 hover:text-white"
            }`}
          >
            <MapIcon className="h-4 w-4" /> Map
          </Link>
          <Link
            to="/list-your-business"
            className={`ml-2 inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition-smooth ${
              scrolled
                ? "bg-foreground text-background hover:opacity-90"
                : "bg-white text-foreground hover:bg-white/90"
            }`}
          >
            <Plus className="h-4 w-4" /> List business
          </Link>
        </nav>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/search")}
            aria-label="Search"
            className={`h-11 w-11 rounded-full ${scrolled ? "" : "text-white hover:bg-white/15 hover:text-white"}`}
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label="Admin"
            className={`hidden h-11 w-11 rounded-full sm:inline-flex ${scrolled ? "" : "text-white hover:bg-white/15 hover:text-white"}`}
          >
            <Link to="/admin"><ShieldCheck className="h-5 w-5" /></Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-11 w-11 rounded-full md:hidden ${scrolled ? "" : "text-white hover:bg-white/15 hover:text-white"}`}
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <nav className="container flex flex-col gap-1 px-4 py-3">
            {CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                to={`/category/${c.slug}`}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-base font-medium hover:bg-secondary"
              >
                {c.label}
              </Link>
            ))}
            <Link
              to="/map"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-xl px-4 py-3 text-base font-medium hover:bg-secondary"
            >
              <MapIcon className="h-4 w-4" /> Map
            </Link>
            <Link
              to="/list-your-business"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center gap-2 rounded-xl bg-foreground px-4 py-3 text-base font-semibold text-background"
            >
              <Plus className="h-4 w-4" /> List your business
            </Link>
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-xl px-4 py-3 text-base font-medium text-muted-foreground hover:bg-secondary"
            >
              <ShieldCheck className="h-4 w-4" /> Admin
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
