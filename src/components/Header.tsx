import { Link, useNavigate } from "react-router-dom";
import { Heart, Map as MapIcon, Menu, Search, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { CATEGORIES } from "@/data/categories";

export const Header = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-4 px-4 md:h-20">
        <Link to="/" className="flex items-center" aria-label="San Vicente Directory home">
          <img
            src="https://hqsbyagdsgfwjvkxmyzm.supabase.co/storage/v1/object/public/logo-sanvic/Untitled%20design.png"
            alt="San Vicente Directory logo"
            className="h-10 w-auto md:h-12 lg:h-14"
            loading="eager"
            decoding="async"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {CATEGORIES.slice(0, 5).map((c) => (
            <Link
              key={c.slug}
              to={`/category/${c.slug}`}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-smooth hover:bg-secondary hover:text-foreground"
            >
              {c.label}
            </Link>
          ))}
          <Link
            to="/map"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-smooth hover:bg-secondary hover:text-foreground"
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
            className="h-11 w-11 rounded-full"
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label="Admin"
            className="hidden h-11 w-11 rounded-full sm:inline-flex"
          >
            <Link to="/admin"><ShieldCheck className="h-5 w-5" /></Link>
          </Button>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 rounded-full md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            {open ? <Menu className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
              to="/admin"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center gap-2 rounded-xl px-4 py-3 text-base font-medium text-muted-foreground hover:bg-secondary"
            >
              <ShieldCheck className="h-4 w-4" /> Admin
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
