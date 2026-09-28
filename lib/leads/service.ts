import "server-only";
import { createHash, randomUUID } from "node:crypto";
import type { NormalizedLead } from "@/types/lead";
import type { CRMResult } from "@/lib/crm/types";
import type { AIProvider } from "@/lib/ai/types";
import { isDemoMode } from "@/lib/config";
import { getAIProvider } from "@/lib/ai";
import { getCRMProvider } from "@/lib/crm";
import type { CRMProvider } from "@/lib/crm/types";
import { leadInputSchema, safeUrl, type LeadInput } from "./schema";
import type { LeadRepository } from "./repository";
import { leadRepository } from "./store";
import { scoreDemoLead, temperatureForScore } from "./scoring";

export class LeadInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LeadInputError";
  }
}

export interface LeadServiceDependencies {
  repository: LeadRepository;
  crm: CRMProvider;
  ai: AIProvider;
  demoMode: boolean;
  now?: () => Date;
  id?: () => string;
}

const defaultDependencies = (): LeadServiceDependencies => ({
  repository: leadRepository,
  crm: getCRMProvider(),
  ai: getAIProvider(),
  demoMode: isDemoMode(),
});

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `${phone.trim().startsWith("+") ? "+" : ""}${digits}`;
}

export function createNormalizedLead(input: LeadInput, now = new Date(), id: string = randomUUID(), demoMode = isDemoMode()): NormalizedLead {
  const submittedAt = now.toISOString();
  const email = input.email.toLowerCase();
  const phone = normalizePhone(input.phone);
  const idempotencyKey = createHash("sha256").update(`${email}|${phone}`).digest("hex");
  const qualification = demoMode ? scoreDemoLead(input) : { status: "pending" as const };
  return {
    id,
    idempotency_key: idempotencyKey,
    source: input.source,
    source_detail: input.source_detail ?? null,
    property_id: null,
    property_name: null,
    full_name: input.full_name,
    email,
    phone,
    intent: input.intent,
    property_type: input.property_type,
    budget_range: input.budget_range,
    timeline: input.timeline,
    financing_status: input.financing_status,
    bedrooms: input.bedrooms,
    preferred_location: input.preferred_location,
    notes: input.notes ?? null,
    page_url: safeUrl(input.page_url),
    referrer: safeUrl(input.referrer),
    utm_source: input.utm_source ?? null,
    utm_medium: input.utm_medium ?? null,
    utm_campaign: input.utm_campaign ?? null,
    utm_content: input.utm_content ?? null,
    utm_term: input.utm_term ?? null,
    consent_to_contact: true,
    marketing_opt_in: input.marketing_opt_in,
    submitted_at: submittedAt,
    updated_at: submittedAt,
    crm: { status: "pending", updated_at: submittedAt },
    automation: { status: "pending", updated_at: submittedAt },
    ai_qualification: { ...qualification, updated_at: submittedAt },
  };
}

async function submitCandidate(candidate: NormalizedLead, dependencies: LeadServiceDependencies, now: () => Date) {
  const result = await dependencies.repository.upsertByIdempotencyKey(candidate);
  const existingLead = result.lead;

  let crmResult: CRMResult;
  try {
    crmResult = await dependencies.crm.syncLead(existingLead);
  } catch {
    crmResult = { status: "failed" };
  }
  const crmState = {
    status: crmResult.status,
    ...(crmResult.contact_id ?? existingLead.crm.contact_id ? { contact_id: crmResult.contact_id ?? existingLead.crm.contact_id } : {}),
    ...(crmResult.opportunity_id ?? existingLead.crm.opportunity_id ? { opportunity_id: crmResult.opportunity_id ?? existingLead.crm.opportunity_id } : {}),
    updated_at: now().toISOString(),
  };
  let lead = (await dependencies.repository.update(existingLead.id, {
    crm: crmState,
    automation: { status: "pending", updated_at: now().toISOString() },
  })) ?? { ...existingLead, crm: crmState };

  const qualificationDone = dependencies.demoMode
    ? lead.ai_qualification.status === "demo"
    : ["qualified", "needs_review"].includes(lead.ai_qualification.status);
  if (!dependencies.demoMode && !qualificationDone && lead.crm.contact_id && dependencies.ai.mode === "configured" && dependencies.ai.qualifyLead) {
    try {
      const output = await dependencies.ai.qualifyLead(lead);
      const qualification = {
        status: output.status === "qualified" && output.score >= 42 ? "qualified" as const : "needs_review" as const,
        score: output.score,
        temperature: temperatureForScore(output.score),
        reason: output.reason,
        summary: output.summary,
        recommended_action: output.recommended_action,
        follow_up_strategy: output.follow_up_strategy,
        last_ai_analysis: now().toISOString(),
        updated_at: now().toISOString(),
      };
      lead = (await dependencies.repository.update(existingLead.id, { ai_qualification: qualification })) ?? { ...lead, ai_qualification: qualification };

      try {
        const qualificationCRM = await dependencies.crm.updateQualification(lead, qualification);
        if (qualificationCRM.status !== "synced") {
          const partialCRM = { ...lead.crm, status: "partial" as const, updated_at: now().toISOString() };
          lead = (await dependencies.repository.update(existingLead.id, { crm: partialCRM })) ?? { ...lead, crm: partialCRM };
        }
      } catch {
        const partialCRM = { ...lead.crm, status: "partial" as const, updated_at: now().toISOString() };
        lead = (await dependencies.repository.update(existingLead.id, { crm: partialCRM })) ?? { ...lead, crm: partialCRM };
      }
    } catch {
      const failedQualification = { status: "failed" as const, updated_at: now().toISOString() };
      lead = (await dependencies.repository.update(existingLead.id, { ai_qualification: failedQualification })) ?? { ...lead, ai_qualification: failedQualification };
    }
  }

  return {
    lead,
    duplicate: result.duplicate,
    demoMode: dependencies.demoMode,
  };
}

type LeadSubmission = Awaited<ReturnType<typeof submitCandidate>>;
const inFlightSubmissions = new Map<string, Promise<LeadSubmission>>();

export async function submitLead(rawInput: unknown, overrides?: Partial<LeadServiceDependencies>) {
  const parsed = leadInputSchema.safeParse(rawInput);
  if (!parsed.success) throw new LeadInputError(parsed.error.issues[0]?.message ?? "Please check the information and try again.");

  const dependencies = { ...defaultDependencies(), ...overrides };
  const now = dependencies.now ?? (() => new Date());
  const id = dependencies.id ?? randomUUID;
  const candidate = createNormalizedLead(parsed.data, now(), id(), dependencies.demoMode);
  const existing = inFlightSubmissions.get(candidate.idempotency_key);
  if (existing) return { ...(await existing), duplicate: true };

  const pending = submitCandidate(candidate, dependencies, now);
  inFlightSubmissions.set(candidate.idempotency_key, pending);
  try {
    return await pending;
  } finally {
    if (inFlightSubmissions.get(candidate.idempotency_key) === pending) inFlightSubmissions.delete(candidate.idempotency_key);
  }
}
