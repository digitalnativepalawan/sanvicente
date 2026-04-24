

## Redesign: Modern, clean, mobile-first directory

A focused refresh across the homepage, business cards, footer, and global typography — consistent in both dark and light mode, no horizontal scroll on layout, and a deliberate horizontal carousel only inside the Featured section.

### 1. Hero section (`src/pages/Index.tsx`)
- Keep the headline + logo + stats. Replace the heavy photo background with a subtle gradient surface (uses existing `--gradient-hero` tokens, but lighter — soft ocean→sunset blend that adapts to theme).
- Center the search bar with larger padding around it (`py-6 md:py-8` wrapper, wider `max-w-2xl`).
- Slightly reduced vertical padding so the page feels less heavy.

### 2. Category grid (`Index.tsx` + `FeaturedCategoryCard.tsx`)
- Keep 4 image-backed cards (Resorts, Restaurants, Tours, Transport).
- Add a small **count badge** chip in the top-right of each card (e.g. "12 listings") in addition to the bottom label.
- Continue to **hide categories with 0 active listings** (already implemented).
- Layout: 1 col mobile → 2 cols tablet → 4 cols desktop. No horizontal scroll.

### 3. Featured section — horizontal carousel
- Rename heading from "Loved by travelers" to **"Featured listings"** with a **"View all →"** link beside it (item 7 + 8).
- Replace the grid with a horizontal-scroll rail:
  - Mobile: snap-scroll, ~85% card width visible (carousel feel).
  - Tablet: 3 cards visible.
  - Desktop: 4 cards visible.
- Implementation: native CSS scroll-snap (`snap-x snap-mandatory overflow-x-auto`) on a flex row — no new dependency. Hidden scrollbar, edge fade, with prev/next buttons on desktop.
- Each card uses the new unified `BusinessCard` design (item 4).

### 4. Unified `BusinessCard` (`src/components/BusinessCard.tsx`)
Single card design used in Featured carousel, Search results, and Category pages:
- 16:9 image on top (replace current 4:3) with rounded top corners.
- Featured badge + favorite heart overlays unchanged.
- Body: category tag (pill), business name + verified check, ★ rating + review count, price range, 1-line short description, **"View details →"** button (full-width, outline style).
- 12px radius (`rounded-xl`), `shadow-soft` → `shadow-card` on hover, hover lift (`-translate-y-1`).
- Works identically in dark/light via existing tokens.

### 5. Footer (`src/components/Footer.tsx`)
- Refactor to **3-column desktop / stacked mobile** layout:
  - Col 1: Logo + tagline + contact + socials
  - Col 2: Categories
  - Col 3: Directory + Featured partner links
- Background: `bg-secondary/50` (light gray in light mode, dark surface in dark mode — already theme-aware).
- Copyright bar unchanged.

### 6. Global consistency
- **Font**: switch body from `Plus Jakarta Sans` to **Inter** (per request: system font Inter/Poppins). Keep `Fraunces` only for hero/section headings, or simplify to Inter throughout for headings too — see Q1 below.
- **Spacing scale**: standardize section padding to `py-16 md:py-24` and container `px-4`. Apply uniformly across Index, Search, Category.
- **Radii**: cards 12px (`rounded-xl`), pills/buttons full, sections 16-24px. Keep `--radius` at 1rem.
- **Shadows**: `shadow-soft` for resting, `shadow-card` on hover — already defined.
- **Contrast**: review muted-foreground in dark mode (currently `210 15% 65%`) — bump to `70%` for AA compliance on dark surfaces.

### 7 & 8. Featured heading
- Replace "Loved by travelers" subtitle with the new heading **"Featured listings"** + supporting line; add inline **"View all →"** link → `/search`.

### Files touched
```text
src/index.css                            (font import → Inter, dark muted contrast)
tailwind.config.ts                       (font family → Inter)
src/pages/Index.tsx                      (hero, sections, carousel)
src/components/BusinessCard.tsx          (unified 16:9 design + button)
src/components/FeaturedCategoryCard.tsx  (count badge chip)
src/components/Footer.tsx                (3-col layout)
```

No DB or backend changes. Site settings (logo sizes, footer links, category images) stay intact.

### Question

**Q1 — Headings font:** You asked for Inter/Poppins. The current site uses **Fraunces** (an editorial serif) for headings, which gives the "editorial/curated" feel. Want to:
- (a) Use **Inter for everything** (cleanest, most modern, fully matches your brief), or
- (b) Keep **Fraunces for headings + Inter for body** (more distinctive, editorial)?

I'll default to **(a) Inter everywhere** if you approve without answering.

