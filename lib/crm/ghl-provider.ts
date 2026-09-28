import "server-only";
import type { NormalizedLead } from "@/types/lead";
import type { CRMProvider, CRMQualification } from "./types";

const API_BASE = "https://services.leadconnectorhq.com";
const API_VERSION = "v3";

interface GHLFields {
  interestedProperty?: string;
  propertyId?: string;
  buyerIntent?: string;
  propertyType?: string;
  budgetRange?: string;
  purchaseTimeline?: string;
  financingStatus?: string;
  bedroomsNeeded?: string;
  preferredLocation?: string;
  additionalNotes?: string;
  leadSourceDetail?: string;
  landingPageUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  referrer?: string;
  iAcquireLeadScore?: string;
  iAcquireLeadTemperature?: string;
  iAcquireLeadId?: string;
  iAcquireOpportunityId?: string;
  iAcquireQualificationStatus?: string;
  iAcquireQualificationReason?: string;
  iAcquireAiSummary?: string;
  iAcquireRecommendedAction?: string;
  iAcquireFollowUpStrategy?: string;
  iAcquireLastAiAnalysis?: string;
  iAcquireAutomationStatus?: string;
}

interface GHLConfig {
  privateIntegrationToken: string;
  locationId: string;
  pipelineId?: string;
  newLeadStageId?: string;
  qualifiedStageId?: string;
  fields?: GHLFields;
}

interface GHLContactResponse {
  contact?: { id?: string };
}

interface GHLOpportunityResponse {
  opportunity?: { id?: string; name?: string; pipelineStageId?: string };
}

interface GHLSearchResponse {
  opportunities?: Array<{ id: string; name: string; pipelineStageId?: string; status?: string }>;
}

const intentLabels: Record<NormalizedLead["intent"], string> = {
  primary_residence: "Primary residence",
  investment: "Investment",
  second_home: "Second home",
  exploring: "Just exploring",
};

const propertyTypeLabels: Record<NormalizedLead["property_type"], string> = {
  house: "House",
  condo: "Condo",
  townhouse: "Townhouse",
  open: "Open to options",
};

const budgetLabels: Record<NormalizedLead["budget_range"], string> = {
  under_150: "Under $150k",
  "150_300": "$150k–$300k",
  "300_500": "$300k–$500k",
  "500_plus": "$500k+",
  not_sure: "Not sure yet",
};

const timelineLabels: Record<NormalizedLead["timeline"], string> = {
  asap: "As soon as possible",
  within_30_days: "Within 30 days",
  one_to_three_months: "1–3 months",
  three_to_six_months: "3–6 months",
  six_plus_months: "6+ months",
  exploring: "Just exploring",
};

const financingLabels: Record<NormalizedLead["financing_status"], string> = {
  cash: "Cash",
  pre_approved: "Pre-approved",
  need_assistance: "Need financing assistance",
  not_sure: "Not sure yet",
};

const sourceLabels: Record<NormalizedLead["source"], string> = {
  landing_form: "Aster Homes website form",
  property_inquiry: "Aster Homes property inquiry",
  ai_chat: "Aster Homes AI chat",
  booking: "Aster Homes booking",
};

const sourceTags: Record<NormalizedLead["source"], string> = {
  landing_form: "source:website",
  property_inquiry: "source:property-inquiry",
  ai_chat: "source:ai-chat",
  booking: "source:booking",
};

const marketingOptInTag = "consent:marketing-email";

export class GHLProvider implements CRMProvider {
  constructor(private readonly config: GHLConfig) {}

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.privateIntegrationToken}`,
        Version: API_VERSION,
        ...init.headers,
      },
      signal: AbortSignal.timeout(12000),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`LeadConnector request failed (${response.status})`);
    if (response.status === 204) return undefined as T;
    const raw = await response.text();
    return (raw ? JSON.parse(raw) : undefined) as T;
  }

  async syncLead(lead: NormalizedLead) {
    const [firstName, ...remainingName] = lead.full_name.split(/\s+/);
    const lastName = remainingName.join(" ");
    const contactCustomFields = this.contactCustomFields(lead);
    const contactResult = await this.request<GHLContactResponse>("/contacts/upsert", {
      method: "POST",
      body: JSON.stringify({
        firstName,
        lastName,
        name: lead.full_name,
        email: lead.email,
        phone: lead.phone,
        locationId: this.config.locationId,
        source: sourceLabels[lead.source],
        ...(contactCustomFields.length ? { customFields: contactCustomFields } : {}),
      }),
    });

    const contactId = contactResult.contact?.id;
    if (!contactId) return { status: "failed" as const };

    let tagsSynced = true;
    try {
      await this.request(`/contacts/${encodeURIComponent(contactId)}/tags`, {
        method: "DELETE",
        body: JSON.stringify({ tags: [marketingOptInTag] }),
      });
    } catch {
      tagsSynced = false;
    }
    try {
      await this.request(`/contacts/${encodeURIComponent(contactId)}/tags`, {
        method: "POST",
        body: JSON.stringify({ tags: [...this.leadTags(lead), ...(lead.marketing_opt_in ? [marketingOptInTag] : [])] }),
      });
    } catch {
      tagsSynced = false;
    }

    if (!this.config.pipelineId || !this.config.newLeadStageId) {
      return { status: "partial" as const, contact_id: contactId };
    }

    let opportunityId: string | undefined;
    try {
      const query = new URLSearchParams({
        locationId: this.config.locationId,
        pipelineId: this.config.pipelineId,
        contactId,
        status: "all",
        page: "1",
        limit: "100",
        order: "added_desc",
      });
      const search = await this.request<GHLSearchResponse>(`/opportunities/search?${query.toString()}`);
      const opportunityName = this.opportunityName(lead);
      const existing = search.opportunities?.find((opportunity) => opportunity.name === opportunityName);

      if (existing) {
        const updated = await this.request<GHLOpportunityResponse>(`/opportunities/${encodeURIComponent(existing.id)}`, {
          method: "PUT",
          // Repeated inquiries update the record without moving it backwards or reopening a closed deal.
          body: JSON.stringify({ name: opportunityName, ...(existing.pipelineStageId ? { pipelineStageId: existing.pipelineStageId } : {}) }),
        });
        opportunityId = updated.opportunity?.id ?? existing.id;
      } else {
        const created = await this.request<GHLOpportunityResponse>("/opportunities/", {
          method: "POST",
          body: JSON.stringify({
            pipelineId: this.config.pipelineId,
            locationId: this.config.locationId,
            name: opportunityName,
            pipelineStageId: this.config.newLeadStageId,
            status: "open",
            contactId,
          }),
        });
        opportunityId = created.opportunity?.id;
      }
    } catch {
      return { status: "partial" as const, contact_id: contactId };
    }

    if (!opportunityId) return { status: "partial" as const, contact_id: contactId };

    const integrationFields = [
      ...(this.config.fields?.iAcquireLeadId ? [{ id: this.config.fields.iAcquireLeadId, fieldValue: lead.id }] : []),
      ...(this.config.fields?.iAcquireOpportunityId ? [{ id: this.config.fields.iAcquireOpportunityId, fieldValue: opportunityId }] : []),
    ];
    let integrationFieldsSynced = true;
    if (integrationFields.length) {
      try {
        await this.request(`/contacts/${encodeURIComponent(contactId)}`, {
          method: "PUT",
          body: JSON.stringify({ customFields: integrationFields }),
        });
      } catch {
        integrationFieldsSynced = false;
      }
    }

    return {
      status: tagsSynced && integrationFieldsSynced ? "synced" as const : "partial" as const,
      contact_id: contactId,
      opportunity_id: opportunityId,
    };
  }

  async updateQualification(lead: NormalizedLead, qualification: CRMQualification) {
    const contactId = lead.crm.contact_id;
    if (!contactId) return { status: "failed" as const };

    const fields = this.qualificationCustomFields(qualification);
    const fieldsSynced = fields.length > 0;
    if (fields.length) {
      try {
        await this.request(`/contacts/${encodeURIComponent(contactId)}`, {
          method: "PUT",
          body: JSON.stringify({ customFields: fields }),
        });
      } catch {
        return { status: "failed" as const, contact_id: contactId, opportunity_id: lead.crm.opportunity_id };
      }
    }

    return {
      status: fieldsSynced ? "synced" as const : "partial" as const,
      contact_id: contactId,
      ...(lead.crm.opportunity_id ? { opportunity_id: lead.crm.opportunity_id } : {}),
    };
  }

  private leadTags(lead: NormalizedLead) {
    return ["source:aster-homes", sourceTags[lead.source], `buyer:${lead.intent.replaceAll("_", "-")}`];
  }

  private opportunityName(lead: NormalizedLead) {
    return lead.property_name
      ? `${lead.full_name} — ${lead.property_name}`
      : `${lead.full_name} — Buyer Inquiry`;
  }

  private contactCustomFields(lead: NormalizedLead) {
    const candidates: Array<[keyof GHLFields, string | null]> = [
      ["interestedProperty", lead.property_name],
      ["propertyId", lead.property_id],
      ["buyerIntent", intentLabels[lead.intent]],
      ["propertyType", propertyTypeLabels[lead.property_type]],
      ["budgetRange", budgetLabels[lead.budget_range]],
      ["purchaseTimeline", timelineLabels[lead.timeline]],
      ["financingStatus", financingLabels[lead.financing_status]],
      ["bedroomsNeeded", lead.bedrooms],
      ["preferredLocation", lead.preferred_location],
      ["additionalNotes", lead.notes],
      ["leadSourceDetail", lead.source_detail ?? sourceLabels[lead.source]],
      ["landingPageUrl", lead.page_url],
      ["utmSource", lead.utm_source],
      ["utmMedium", lead.utm_medium],
      ["utmCampaign", lead.utm_campaign],
      ["utmContent", lead.utm_content],
      ["utmTerm", lead.utm_term],
      ["referrer", lead.referrer],
    ];
    return candidates.flatMap(([key, fieldValue]) => {
      const id = this.config.fields?.[key];
      return id && fieldValue ? [{ id, fieldValue }] : [];
    });
  }

  private qualificationCustomFields(qualification: CRMQualification) {
    const statusLabels: Record<CRMQualification["status"], string> = {
      qualified: "Qualified",
      needs_review: "Needs Review",
      disqualified: "Disqualified",
    };
    const candidates: Array<[keyof GHLFields, string | number | undefined]> = [
      ["iAcquireLeadScore", qualification.score],
      ["iAcquireLeadTemperature", qualification.temperature.toUpperCase()],
      ["iAcquireQualificationStatus", statusLabels[qualification.status]],
      ["iAcquireQualificationReason", qualification.reason],
      ["iAcquireAiSummary", qualification.summary],
      ["iAcquireRecommendedAction", qualification.recommended_action],
      ["iAcquireFollowUpStrategy", qualification.follow_up_strategy],
      ["iAcquireLastAiAnalysis", qualification.last_ai_analysis ?? new Date().toISOString()],
      ["iAcquireAutomationStatus", "qualification_complete"],
    ];
    return candidates.flatMap(([key, fieldValue]) => {
      const id = this.config.fields?.[key];
      return id && fieldValue !== undefined && fieldValue !== "" ? [{ id, fieldValue }] : [];
    });
  }
}
