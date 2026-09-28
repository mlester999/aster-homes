import type { NormalizedLead } from "@/types/lead";

export interface CRMResult {
  status: "not_configured" | "synced" | "partial" | "failed";
  contact_id?: string;
  opportunity_id?: string;
}

export interface CRMQualification {
  status: "qualified" | "needs_review" | "disqualified";
  score: number;
  temperature: "hot" | "warm" | "cold";
  reason?: string;
  summary?: string;
  recommended_action?: string;
  follow_up_strategy?: string;
  last_ai_analysis?: string;
}

export interface CRMProvider {
  syncLead(lead: NormalizedLead): Promise<CRMResult>;
  updateQualification(lead: NormalizedLead, qualification: CRMQualification): Promise<CRMResult>;
}
