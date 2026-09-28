import type { PropertyType } from "@/types/lead";

export interface HomeStyleCard {
  property_type: Exclude<PropertyType, "open">;
  title: string;
  description: string;
}

export const homeStyleCards: readonly HomeStyleCard[] = [
  {
    property_type: "house",
    title: "Detached homes",
    description: "Explore layouts with more privacy, flexible living space, and room outdoors.",
  },
  {
    property_type: "condo",
    title: "Condominiums",
    description: "Compare floor plans, building features, and locations that fit your day.",
  },
  {
    property_type: "townhouse",
    title: "Townhomes",
    description: "Consider attached home styles, practical layouts, and shared amenities.",
  },
];
