import type { PriceRange } from "@/types/business";

export const PRICE_LABELS: Record<PriceRange, string> = {
  "₱": "Budget — under ₱1,500 per night or per meal",
  "₱₱": "Mid-range — ₱1,500 to ₱4,000",
  "₱₱₱": "Premium — ₱4,000 and above",
  "₱₱₱₱": "Luxury — top-tier pricing",
};

export const priceLabel = (p: PriceRange) => PRICE_LABELS[p] ?? p;
