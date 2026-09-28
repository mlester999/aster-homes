import type { LeadSource } from "@/types/lead";

const sourceLabels: Record<LeadSource, string> = {
  landing_form: "Landing page",
  property_inquiry: "Property inquiry",
  ai_chat: "Aster Assistant",
  booking: "Consultation request",
};

const valueLabels: Record<string, string> = {
  primary_residence: "Primary residence",
  investment: "Investment",
  second_home: "Second home",
  exploring: "Still exploring",
  house: "House",
  condo: "Condo",
  townhouse: "Townhouse",
  open: "Open to options",
  under_150: "Under $150k",
  "150_300": "$150k–$300k",
  "300_500": "$300k–$500k",
  "500_plus": "$500k+",
  not_sure: "Not sure yet",
  asap: "As soon as possible",
  within_30_days: "Within 30 days",
  one_to_three_months: "1–3 months",
  three_to_six_months: "3–6 months",
  six_plus_months: "6+ months",
  cash: "Cash",
  pre_approved: "Pre-approved",
  need_assistance: "Needs financing help",
  "1": "1 bedroom",
  "2": "2 bedrooms",
  "3": "3 bedrooms",
  "4+": "4+ bedrooms",
};

const integrationStatusLabels: Record<string, string> = {
  not_configured: "Not configured",
  pending: "Pending",
  synced: "Synced",
  partial: "Partial",
  triggered: "Triggered",
  failed: "Failed",
};

const qualificationStatusLabels: Record<string, string> = {
  demo: "Demo qualification",
  pending: "Pending",
  qualified: "Qualified",
  needs_review: "Needs review",
  disqualified: "Disqualified",
  failed: "Failed",
};

export function activitySourceLabel(source: LeadSource): string {
  return sourceLabels[source];
}

export function activityValueLabel(value: string): string {
  return valueLabels[value] ?? value.replaceAll("_", " ");
}

export function integrationStatusLabel(status: string): string {
  return integrationStatusLabels[status] ?? "Unknown";
}

export function qualificationStatusLabel(status: string): string {
  return qualificationStatusLabels[status] ?? "Unknown";
}

export function maskLeadName(fullName: string): string {
  const initials = fullName.trim().split(/\s+/).filter(Boolean).map((part) => `${Array.from(part)[0]?.toLocaleUpperCase() ?? ""}.`);
  return initials.length > 0 ? initials.join(" ") : "Lead";
}

export function maskPreferredLocation(location: string): string {
  const cleanLocation = location.trim().replace(/\s+/g, " ");
  if (!cleanLocation) return "Not provided";
  if (/^\d/.test(cleanLocation) || /\b(?:street|st|road|rd|avenue|ave|drive|dr|lane|ln|boulevard|blvd|unit|apt|apartment|suite)\b|#/i.test(cleanLocation)) {
    return "Specific address hidden";
  }
  return cleanLocation.split(",")[0].slice(0, 80);
}

export function isInternalDemoTest(email: string, notes?: string | null): boolean {
  return /synthetic demo test/i.test(notes ?? "") || email.trim().toLowerCase().endsWith(".test");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function redactActivitySummary(summary: string, fullName: string, preferredLocation?: string): string {
  let safeSummary = summary.trim();
  const name = fullName.trim();
  const location = preferredLocation?.trim();
  if (name) safeSummary = safeSummary.replace(new RegExp(escapeRegExp(name), "gi"), "the lead");
  if (location) safeSummary = safeSummary.replace(new RegExp(escapeRegExp(location), "gi"), "the preferred area");
  return safeSummary
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[email hidden]")
    .replace(/\+?\d[\d\s().-]{6,}\d/g, "[phone hidden]")
    .slice(0, 320);
}
