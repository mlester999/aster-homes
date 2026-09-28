import type { BudgetRange, BuyerIntent, FinancingStatus, PropertyType, PurchaseTimeline } from "@/types/lead";

export const chatOptions = {
  intent: [
    { value: "primary_residence" as BuyerIntent, label: "Primary residence" },
    { value: "investment" as BuyerIntent, label: "Investment" },
    { value: "second_home" as BuyerIntent, label: "Second home" },
    { value: "exploring" as BuyerIntent, label: "Just exploring" },
  ],
  budget: [
    { value: "under_150" as BudgetRange, label: "Under $150k" },
    { value: "150_300" as BudgetRange, label: "$150k–$300k" },
    { value: "300_500" as BudgetRange, label: "$300k–$500k" },
    { value: "500_plus" as BudgetRange, label: "$500k+" },
    { value: "not_sure" as BudgetRange, label: "Not sure yet" },
  ],
  propertyType: [
    { value: "house" as PropertyType, label: "House" },
    { value: "condo" as PropertyType, label: "Condo" },
    { value: "townhouse" as PropertyType, label: "Townhouse" },
    { value: "open" as PropertyType, label: "Open to options" },
  ],
  bedrooms: [
    { value: "1", label: "1 bedroom" },
    { value: "2", label: "2 bedrooms" },
    { value: "3", label: "3 bedrooms" },
    { value: "4+", label: "4+ bedrooms" },
  ],
  timeline: [
    { value: "asap" as PurchaseTimeline, label: "As soon as possible" },
    { value: "within_30_days" as PurchaseTimeline, label: "Within 30 days" },
    { value: "one_to_three_months" as PurchaseTimeline, label: "1–3 months" },
    { value: "three_to_six_months" as PurchaseTimeline, label: "3–6 months" },
    { value: "six_plus_months" as PurchaseTimeline, label: "6+ months" },
    { value: "exploring" as PurchaseTimeline, label: "Just exploring" },
  ],
  financing: [
    { value: "cash" as FinancingStatus, label: "Cash" },
    { value: "pre_approved" as FinancingStatus, label: "Pre-approved" },
    { value: "need_assistance" as FinancingStatus, label: "Need financing assistance" },
    { value: "not_sure" as FinancingStatus, label: "Not sure yet" },
  ],
} as const;
