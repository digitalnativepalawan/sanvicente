import { create } from "zustand";

interface HoverState {
  hoveredId: string | null;
  setHovered: (id: string | null) => void;
  categoryFilter: string; // "all" or category slug
  setCategoryFilter: (slug: string) => void;
}

export const useHoverStore = create<HoverState>((set) => ({
  hoveredId: null,
  setHovered: (id) => set({ hoveredId: id }),
  categoryFilter: "all",
  setCategoryFilter: (slug) => set({ categoryFilter: slug }),
}));
