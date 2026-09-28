import { describe, expect, it, vi } from "vitest";
import type { NormalizedLead } from "@/types/lead";
import type { LeadRepository } from "@/lib/leads/repository";
import type { LeadInput } from "@/lib/leads/schema";
import type { CRMProvider } from "@/lib/crm/types";
import type { AIProvider } from "@/lib/ai/types";
import { createNormalizedLead, submitLead } from "@/lib/leads/service";
import { leadInputSchema } from "@/lib/leads/schema";

function input(overrides: Partial<LeadInput> = {}): LeadInput {
  return {
    source: "property_inquiry",
    full_name: "Taylor Example",
    email: "Taylor@example.test",
    phone: "+1 (555) 010-0200",
    intent: "primary_residence",
    property_type: "condo",
    budget_range: "under_150",
    timeline: "one_to_three_months",
    financing_status: "pre_approved",
    bedrooms: "1",
    preferred_location: "Northhaven",
    consent_to_contact: true,
    marketing_opt_in: false,
    ...overrides,
  };
}

class MemoryLeadRepository implements LeadRepository {
  readonly records = new Map<string, NormalizedLead>();
  async upsertByIdempotencyKey(lead: NormalizedLead) {
    const existing = [...this.records.values()].find((item) => item.idempotency_key === lead.idempotency_key);
    if (existing) {
      const merged = { ...existing, ...lead, id: existing.id, crm: existing.crm, automation: existing.automation, ai_qualification: existing.ai_qualification };
      this.records.set(existing.id, merged);
      return { lead: merged, duplicate: true };
    }
    this.records.set(lead.id, lead);
    return { lead, duplicate: false };
  }
  async update(id: string, updates: Partial<NormalizedLead>) {
    const existing = this.records.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    this.records.set(id, updated);
    return updated;
  }
  async list() { return [...this.records.values()]; }
}

function dependencies(repository: MemoryLeadRepository, crm: CRMProvider) {
  return {
    repository,
    crm,
    ai: { mode: "guided" as const, answerQuestion: async () => "" },
    demoMode: true,
    now: () => new Date("2026-09-27T12:00:00.000Z"),
    id: () => "lead-test-id",
  };
}

describe("lead schema and normalization", () => {
  it("requires explicit contact consent and rejects unexpected fields", () => {
    expect(leadInputSchema.safeParse(input()).success).toBe(true);
    expect(leadInputSchema.safeParse(input({ consent_to_contact: false as never })).success).toBe(false);
    expect(leadInputSchema.safeParse({ ...input(), private_admin: true }).success).toBe(false);
  });

  it("normalizes contact details, attribution and development scoring", () => {
    const parsed = leadInputSchema.parse(input({ page_url: "https://user:pass@aster.example/home#form", utm_source: "newsletter" }));
    const lead = createNormalizedLead(parsed, new Date("2026-09-27T12:00:00.000Z"), "lead-1", true);
    expect(lead.email).toBe("taylor@example.test");
    expect(lead.phone).toBe("+15550100200");
    expect(lead.property_name).toBeNull();
    expect(lead.property_id).toBeNull();
    expect(lead.page_url).toBe("https://aster.example/home");
    expect(lead.utm_source).toBe("newsletter");
    expect(lead.ai_qualification.status).toBe("demo");
    expect(lead.consent_to_contact).toBe(true);
    expect(lead.marketing_opt_in).toBe(false);
  });

  it("rejects public submissions containing an arbitrary property ID", () => {
    expect(leadInputSchema.safeParse({ ...input(), property_id: "unverified-listing" }).success).toBe(false);
  });
});

describe("shared lead submission service", () => {
  it("stores a lead despite CRM failure and keeps workflow status honest", async () => {
    const repository = new MemoryLeadRepository();
    const crm = { syncLead: vi.fn(async () => { throw new Error("private upstream error"); }) } as unknown as CRMProvider;
    const result = await submitLead(input(), dependencies(repository, crm));

    expect(repository.records.size).toBe(1);
    expect(result.lead.crm.status).toBe("failed");
    expect(result.lead.automation.status).toBe("pending");
    expect(result.lead.ai_qualification.status).toBe("demo");
  });

  it("deduplicates repeat submissions while refreshing the idempotent CRM contact", async () => {
    const repository = new MemoryLeadRepository();
    const crm = { syncLead: vi.fn(async () => ({ status: "synced" as const, contact_id: "contact-1", opportunity_id: "opportunity-1" })) } as unknown as CRMProvider;
    const deps = dependencies(repository, crm);

    const first = await submitLead(input(), deps);
    const second = await submitLead(input({ preferred_location: "Northhaven village" }), deps);

    expect(first.duplicate).toBe(false);
    expect(second.duplicate).toBe(true);
    expect(repository.records.size).toBe(1);
    expect(crm.syncLead).toHaveBeenCalledTimes(2);
    expect(second.lead.preferred_location).toBe("Northhaven village");
    expect(second.lead.ai_qualification.status).toBe("demo");
  });

  it("coalesces concurrent submissions so integrations run once", async () => {
    const repository = new MemoryLeadRepository();
    let finishCRM: ((value: { status: "synced" }) => void) | undefined;
    const crm = { syncLead: vi.fn(() => new Promise<{ status: "synced" }>((resolve) => { finishCRM = resolve; })) } as unknown as CRMProvider;
    const deps = dependencies(repository, crm);

    const first = submitLead(input(), deps);
    const second = submitLead(input(), deps);
    await vi.waitFor(() => expect(crm.syncLead).toHaveBeenCalledTimes(1));
    finishCRM?.({ status: "synced" });
    const [firstResult, secondResult] = await Promise.all([first, second]);

    expect(firstResult.duplicate).toBe(false);
    expect(secondResult.duplicate).toBe(true);
    expect(crm.syncLead).toHaveBeenCalledTimes(1);
  });

  it("runs live AI after contact sync and writes structured qualification fields to HighLevel", async () => {
    const repository = new MemoryLeadRepository();
    const order: string[] = [];
    const crm = {
      syncLead: vi.fn(async () => {
        order.push("crm");
        return { status: "synced" as const, contact_id: "contact-1", opportunity_id: "opportunity-1" };
      }),
      updateQualification: vi.fn(async () => {
        order.push("qualification-fields");
        return { status: "synced" as const, contact_id: "contact-1", opportunity_id: "opportunity-1" };
      }),
    } as unknown as CRMProvider;
    const ai: AIProvider = {
      mode: "configured",
      answerQuestion: async () => "",
      qualifyLead: vi.fn(async (lead: NormalizedLead) => {
        order.push("ai");
        expect(lead.crm).toMatchObject({ contact_id: "contact-1", opportunity_id: "opportunity-1", status: "synced" });
        return { score: 84, status: "qualified" as const, reason: "Near-term stated purchase timeline.", summary: "Seeking a two-bedroom condo.", recommended_action: "Offer a consultation.", follow_up_strategy: "Prioritize a prompt human follow-up." };
      }),
    };
    const result = await submitLead(input(), { ...dependencies(repository, crm), ai, demoMode: false });

    expect(order).toEqual(["crm", "ai", "qualification-fields"]);
    expect(result.lead.crm).toMatchObject({ status: "synced", contact_id: "contact-1" });
    expect(result.lead.ai_qualification).toMatchObject({ status: "qualified", score: 84, temperature: "hot", reason: "Near-term stated purchase timeline." });
  });

  it("does not fabricate a live qualification when AI credentials are not configured", async () => {
    const repository = new MemoryLeadRepository();
    const crm = {
      syncLead: vi.fn(async () => ({ status: "synced" as const, contact_id: "contact-1", opportunity_id: "opportunity-1" })),
      updateQualification: vi.fn(),
    } as unknown as CRMProvider;
    const result = await submitLead(input(), { ...dependencies(repository, crm), demoMode: false });

    expect(result.lead.ai_qualification.status).toBe("pending");
    expect(crm.updateQualification).not.toHaveBeenCalled();
  });
});
