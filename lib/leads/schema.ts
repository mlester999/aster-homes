import { z } from "zod";
import { bedroomOptions, budgetRanges, buyerIntents, financingStatuses, leadSources, propertyTypes, purchaseTimelines } from "@/types/lead";

const cleanText = (max: number) => z.string().trim().max(max).transform((value) => value.replace(/[\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim());

export const leadInputSchema = z.object({
  source: z.enum(leadSources),
  source_detail: cleanText(100).optional().nullable(),
  full_name: cleanText(100).refine((value) => value.length >= 2, "Enter your name"),
  email: z.email().trim().toLowerCase().max(254),
  phone: cleanText(30).refine((value) => {
    const digits = value.replace(/\D/g, "");
    return digits.length >= 7 && digits.length <= 15;
  }, "Enter a valid phone number"),
  intent: z.enum(buyerIntents),
  property_type: z.enum(propertyTypes),
  budget_range: z.enum(budgetRanges),
  timeline: z.enum(purchaseTimelines),
  financing_status: z.enum(financingStatuses),
  bedrooms: z.enum(bedroomOptions),
  preferred_location: cleanText(120).refine((value) => value.length >= 2, "Share a preferred location, or enter ‘Open to options’"),
  notes: cleanText(800).optional().nullable(),
  page_url: z.string().trim().max(2000).optional().nullable(),
  referrer: z.string().trim().max(2000).optional().nullable(),
  utm_source: cleanText(200).optional().nullable(),
  utm_medium: cleanText(200).optional().nullable(),
  utm_campaign: cleanText(200).optional().nullable(),
  utm_content: cleanText(200).optional().nullable(),
  utm_term: cleanText(200).optional().nullable(),
  consent_to_contact: z.literal(true, { error: "Please confirm that Aster Homes may contact you about this inquiry." }),
  marketing_opt_in: z.boolean().optional().default(false),
}).strict();

export type LeadInput = z.infer<typeof leadInputSchema>;

export function safeUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    url.username = "";
    url.password = "";
    url.hash = "";
    return url.toString().slice(0, 2000);
  } catch {
    return null;
  }
}
