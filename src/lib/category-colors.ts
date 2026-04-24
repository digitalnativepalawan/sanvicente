// Shared category color tokens used by map pins + card badges.
export const CATEGORY_COLORS: Record<string, { hex: string; label: string }> = {
  resorts:     { hex: "#F97316", label: "Resorts" },
  restaurants: { hex: "#EF4444", label: "Restaurants" },
  tours:       { hex: "#3B82F6", label: "Tours" },
  transport:   { hex: "#A855F7", label: "Transport" },
  shops:       { hex: "#EAB308", label: "Shops" },
  services:    { hex: "#6B7280", label: "Services" },
};

export const getCategoryColor = (slug: string) =>
  CATEGORY_COLORS[slug]?.hex ?? "#6B7280";
