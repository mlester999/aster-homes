import "server-only";
import { isDemoMode } from "@/lib/config";
import { DemoCRMProvider } from "./demo-provider";
import { GHLProvider } from "./ghl-provider";
import type { CRMProvider } from "./types";

export function getCRMProvider(): CRMProvider {
  if (isDemoMode()) return new DemoCRMProvider();
  const privateIntegrationToken = process.env.GHL_PRIVATE_INTEGRATION_TOKEN?.trim();
  const locationId = process.env.GHL_LOCATION_ID?.trim();
  if (!privateIntegrationToken || !locationId) return new DemoCRMProvider();
  return new GHLProvider({
    privateIntegrationToken,
    locationId,
    pipelineId: process.env.GHL_PIPELINE_ID?.trim(),
    newLeadStageId: process.env.GHL_NEW_LEAD_STAGE_ID?.trim(),
    qualifiedStageId: process.env.GHL_QUALIFIED_STAGE_ID?.trim(),
    fields: {
      interestedProperty: process.env.GHL_FIELD_INTERESTED_PROPERTY_ID?.trim(),
      propertyId: process.env.GHL_FIELD_PROPERTY_ID?.trim(),
      buyerIntent: process.env.GHL_FIELD_BUYER_INTENT_ID?.trim(),
      propertyType: process.env.GHL_FIELD_PROPERTY_TYPE_ID?.trim(),
      budgetRange: process.env.GHL_FIELD_BUDGET_RANGE_ID?.trim(),
      purchaseTimeline: process.env.GHL_FIELD_PURCHASE_TIMELINE_ID?.trim(),
      financingStatus: process.env.GHL_FIELD_FINANCING_STATUS_ID?.trim(),
      bedroomsNeeded: process.env.GHL_FIELD_BEDROOMS_NEEDED_ID?.trim(),
      preferredLocation: process.env.GHL_FIELD_PREFERRED_LOCATION_ID?.trim(),
      additionalNotes: process.env.GHL_FIELD_ADDITIONAL_NOTES_ID?.trim(),
      leadSourceDetail: process.env.GHL_FIELD_LEAD_SOURCE_DETAIL_ID?.trim(),
      landingPageUrl: process.env.GHL_FIELD_LANDING_PAGE_URL_ID?.trim(),
      utmSource: process.env.GHL_FIELD_UTM_SOURCE_ID?.trim(),
      utmMedium: process.env.GHL_FIELD_UTM_MEDIUM_ID?.trim(),
      utmCampaign: process.env.GHL_FIELD_UTM_CAMPAIGN_ID?.trim(),
      utmContent: process.env.GHL_FIELD_UTM_CONTENT_ID?.trim(),
      utmTerm: process.env.GHL_FIELD_UTM_TERM_ID?.trim(),
      referrer: process.env.GHL_FIELD_REFERRER_ID?.trim(),
      iAcquireLeadScore: process.env.GHL_FIELD_IACQUIRE_LEAD_SCORE_ID?.trim(),
      iAcquireLeadTemperature: process.env.GHL_FIELD_IACQUIRE_LEAD_TEMPERATURE_ID?.trim(),
      iAcquireLeadId: process.env.GHL_FIELD_IACQUIRE_LEAD_ID?.trim(),
      iAcquireOpportunityId: process.env.GHL_FIELD_IACQUIRE_OPPORTUNITY_ID?.trim(),
      iAcquireQualificationStatus: process.env.GHL_FIELD_IACQUIRE_QUALIFICATION_STATUS_ID?.trim(),
      iAcquireQualificationReason: process.env.GHL_FIELD_IACQUIRE_QUALIFICATION_REASON_ID?.trim(),
      iAcquireAiSummary: process.env.GHL_FIELD_IACQUIRE_AI_SUMMARY_ID?.trim(),
      iAcquireRecommendedAction: process.env.GHL_FIELD_IACQUIRE_RECOMMENDED_ACTION_ID?.trim(),
      iAcquireFollowUpStrategy: process.env.GHL_FIELD_IACQUIRE_FOLLOW_UP_STRATEGY_ID?.trim(),
      iAcquireLastAiAnalysis: process.env.GHL_FIELD_IACQUIRE_LAST_AI_ANALYSIS_ID?.trim(),
      iAcquireAutomationStatus: process.env.GHL_FIELD_IACQUIRE_AUTOMATION_STATUS_ID?.trim(),
    },
  });
}
