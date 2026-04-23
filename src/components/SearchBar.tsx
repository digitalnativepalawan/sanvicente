import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  defaultValue?: string;
  variant?: "hero" | "compact";
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
