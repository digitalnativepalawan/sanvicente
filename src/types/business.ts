export type Category =
  | "resorts"
  | "restaurants"
  | "tours"
  | "transport"
  | "shops"
  | "services";

export type ListingTier = "free" | "featured" | "premium";
export type PriceRange = "₱" | "₱₱" | "₱₱₱" | "₱₱₱₱";

export interface OpeningHours {
  mon?: string;
  tue?: string;
  wed?: string;
  thu?: string;
  fri?: string;
  sat?: string;
  sun?: string;
}

export interface RoomType {
  id: string;
  name: string;
  description?: string;
  pricePerNight?: string;
  maxGuests?: number;
  images: string[]; // up to 6
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  category: Category;
  subcategory?: string;
  phone?: string;
  email?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  address: string;
  barangay: string;
  googleMapsLink?: string;
  description: string;
  shortDescription: string;
  services: string[];
  amenities: string[];
  image: string;
  images?: string[];
  menuImages?: string[]; // up to 10
  roomTypes?: RoomType[];
  priceRange: PriceRange;
  openingHours: OpeningHours;
  isFeatured: boolean;
  isVerified: boolean;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  viewCount: number;
  listingTier: ListingTier;
  latitude?: number;
  longitude?: number;
  createdAt: string;
}

export interface CategoryMeta {
  slug: Category;
  label: string;
  description: string;
  icon: string; // lucide name
}
