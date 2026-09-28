export const leadSources = ["landing_form", "property_inquiry", "ai_chat", "booking"] as const;
export type LeadSource = (typeof leadSources)[number];

export const buyerIntents = ["primary_residence", "investment", "second_home", "exploring"] as const;
export type BuyerIntent = (typeof buyerIntents)[number];

export const propertyTypes = ["house", "condo", "townhouse", "open"] as const;
export type PropertyType = (typeof propertyTypes)[number];

export const budgetRanges = ["under_150", "150_300", "300_500", "500_plus", "not_sure"] as const;
export type BudgetRange = (typeof budgetRanges)[number];

export const purchaseTimelines = ["asap", "within_30_days", "one_to_three_months", "three_to_six_months", "six_plus_months", "exploring"] as const;
export type PurchaseTimeline = (typeof purchaseTimelines)[number];

export const financingStatuses = ["cash", "pre_approved", "need_assistance", "not_sure"] as const;
export type FinancingStatus = (typeof financingStatuses)[number];

export const bedroomOptions = ["1", "2", "3", "4+"] as const;
export type BedroomPreference = (typeof bedroomOptions)[number];

export type IntegrationStatus = "not_configured" | "pending" | "synced" | "partial" | "triggered" | "failed";
export type QualificationStatus = "demo" | "pending" | "qualified" | "needs_review" | "disqualified" | "failed";

export interface IntegrationState {
  status: IntegrationStatus;
  message?: string;
  updated_at: string;
  contact_id?: string;
  opportunity_id?: string;
}

export interface LeadQualification {
  status: QualificationStatus;
  score?: number;
  temperature?: "hot" | "warm" | "cold";
  summary?: string;
  reason?: string;
  recommended_action?: string;
  follow_up_strategy?: string;
  last_ai_analysis?: string;
  updated_at: string;
}

export interface NormalizedLead {
  id: string;
  idempotency_key: string;
  source: LeadSource;
  source_detail: string | null;
  property_id: string | null;
  property_name: string | null;
  full_name: string;
  email: string;
  phone: string;
  intent: BuyerIntent;
  property_type: PropertyType;
  budget_range: BudgetRange;
  timeline: PurchaseTimeline;
  financing_status: FinancingStatus;
  bedrooms: BedroomPreference;
  preferred_location: string;
  notes: string | null;
  page_url: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  consent_to_contact: true;
  marketing_opt_in: boolean;
  submitted_at: string;
  updated_at: string;
  crm: IntegrationState;
  automation: IntegrationState;
  ai_qualification: LeadQualification;
}

export type ActivityLead = Omit<NormalizedLead, "idempotency_key" | "consent_to_contact" | "notes" | "page_url" | "referrer" | "utm_source" | "utm_medium" | "utm_campaign" | "utm_content" | "utm_term"> & {
  full_name: string;
  email: string;
  phone: string;
};
