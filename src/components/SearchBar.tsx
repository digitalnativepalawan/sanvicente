import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  defaultValue?: string;
  variant?: "hero" | "compact" | "hero-dark";
}

export const SearchBar = ({ defaultValue = "", variant = "compact" }: Props) => {
  const [q, setQ] = useState(defaultValue);
  const navigate = useNavigate();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    navigate(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
  };

  const isHero = variant === "hero";
  const isHeroDark = variant === "hero-dark";

  if (isHeroDark) {
    return (
      <form
        onSubmit={onSubmit}
        role="search"
        className="flex w-full items-center gap-2 rounded-3xl border border-white/40 bg-white/20 p-2.5 shadow-elegant backdrop-blur-2xl ring-1 ring-white/10 transition-all duration-500 hover:bg-white/25 hover:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.5)]"
      >
        <div className="flex flex-1 items-center gap-3 px-4">
          <Search className="h-5 w-5 shrink-0 text-white/90" aria-hidden />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="search"
            placeholder="Search resorts, tours, restaurants…"
            aria-label="Search businesses"
            className="h-12 w-full bg-transparent text-base text-white outline-none placeholder:text-white/70"
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="h-12 shrink-0 rounded-2xl bg-primary px-6 font-semibold text-primary-foreground shadow-glow hover:bg-primary/90"
        >
          Search
        </Button>
      </form>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className={`flex w-full items-center gap-2 rounded-2xl border border-border bg-card/95 backdrop-blur-md ${
        isHero ? "p-2 shadow-elegant" : "p-1.5 shadow-soft"
      }`}
      role="search"
    >
      <div className="flex flex-1 items-center gap-3 px-3">
        <Search className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          type="search"
          placeholder="Search resorts, tours, restaurants…"
          aria-label="Search businesses"
          className={`w-full bg-transparent outline-none placeholder:text-muted-foreground ${
            isHero ? "h-12 text-base" : "h-10 text-sm"
          }`}
        />
      </div>
      <Button
        type="submit"
        size={isHero ? "lg" : "default"}
        className={`shrink-0 rounded-xl gradient-sunset font-semibold text-accent-foreground hover:opacity-95 ${
          isHero ? "h-12 px-6" : "h-10 px-4"
        }`}
      >
        Search
      </Button>
    </form>
  );
};
