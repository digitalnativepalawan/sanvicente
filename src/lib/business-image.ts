import fallback from "@/assets/biz-resort.jpg";
import type { Business } from "@/types/business";

/** Returns the first image from `images` if present, else `image`, else mock fallback. */
export const getBusinessImage = (b: Pick<Business, "image" | "images">): string => {
  const first = Array.isArray(b.images) ? b.images.find((u) => typeof u === "string" && u.trim()) : undefined;
  if (first) return first;
  if (b.image && b.image.trim()) return b.image;
  return fallback;
};
