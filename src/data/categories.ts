import type { CategoryMeta } from "@/types/business";

export const CATEGORIES: CategoryMeta[] = [
  {
    slug: "resorts",
    label: "Resorts & Stays",
    description: "Beachfront villas, boutique hotels, and homestays along Long Beach and beyond.",
    icon: "Palmtree",
  },
  {
    slug: "restaurants",
    label: "Restaurants",
    description: "Fresh seafood, Filipino classics, and seaside cafés worth the trip.",
    icon: "UtensilsCrossed",
  },
  {
    slug: "tours",
    label: "Tours & Activities",
    description: "Island hopping, snorkeling, and guided adventures across San Vicente.",
    icon: "Compass",
  },
  {
    slug: "transport",
    label: "Transport",
    description: "Tricycles, vans, motorbike rentals, and airport transfers.",
    icon: "Car",
  },
  {
    slug: "shops",
    label: "Shops",
    description: "Souvenirs, sari-sari stores, dive gear, and local crafts.",
    icon: "ShoppingBag",
  },
  {
    slug: "services",
    label: "Services",
    description: "Spas, laundry, repairs, and other helpful local services.",
    icon: "Sparkles",
  },
];

export const getCategory = (slug: string) =>
  CATEGORIES.find((c) => c.slug === slug);
