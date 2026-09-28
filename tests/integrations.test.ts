import { beforeEach, describe, expect, it, vi } from "vitest";
import { GHLProvider } from "@/lib/crm/ghl-provider";
import { createNormalizedLead } from "@/lib/leads/service";
import { leadInputSchema } from "@/lib/leads/schema";
import type { LeadSource } from "@/types/lead";

function makeLead(source: LeadSource = "property_inquiry") {
  return createNormalizedLead(leadInputSchema.parse({
    source, full_name: "Taylor Example", email: "taylor@example.test", phone: "+15550100200",
    intent: "primary_residence", property_type: "condo", budget_range: "under_150", timeline: "one_to_three_months",
    financing_status: "pre_approved", bedrooms: "1", preferred_location: "Northhaven", consent_to_contact: true,
  }), new Date("2026-09-27T12:00:00.000Z"), "lead-1", false);
}

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

describe("GoHighLevel adapter", () => {
  it("upserts a contact, tags it and creates an opportunity in the New Lead stage", async () => {
    fetchMock.mockImplementation(async (input, init) => {
      const url = new URL(String(input));
      if (url.pathname === "/contacts/upsert") return Response.json({ contact: { id: "contact-1" } });
      if (url.pathname === "/contacts/contact-1/tags") return Response.json({ success: true });
      if (url.pathname === "/opportunities/search") return Response.json({ opportunities: [] });
      if (url.pathname === "/opportunities/" && init?.method === "POST") return Response.json({ opportunity: { id: "opportunity-1" } });
      return new Response("unexpected", { status: 404 });
    });
    const provider = new GHLProvider({ privateIntegrationToken: "private-token", locationId: "location-1", pipelineId: "pipeline-1", newLeadStageId: "stage-new" });

    const result = await provider.syncLead(makeLead());
    const calls = fetchMock.mock.calls;
    const createOpportunity = calls.find(([input, init]) => new URL(String(input)).pathname === "/opportunities/" && init?.method === "POST");
    const contactUpsert = calls.find(([input]) => new URL(String(input)).pathname === "/contacts/upsert");
    const opportunitySearch = calls.find(([input]) => new URL(String(input)).pathname === "/opportunities/search");

    expect(result).toEqual({ status: "synced", contact_id: "contact-1", opportunity_id: "opportunity-1" });
    const addedTagsCall = calls.find(([input, init]) => new URL(String(input)).pathname === "/contacts/contact-1/tags" && init?.method === "POST");
    expect(addedTagsCall).toBeDefined();
    expect(JSON.parse(String(addedTagsCall?.[1]?.body)).tags).toEqual(["source:aster-homes", "source:property-inquiry", "buyer:primary-residence"]);
    expect(JSON.parse(String(createOpportunity?.[1]?.body)).pipelineStageId).toBe("stage-new");
    expect(JSON.parse(String(contactUpsert?.[1]?.body)).source).toBe("Aster Homes property inquiry");
    expect(JSON.parse(String(contactUpsert?.[1]?.body)).customFields).toBeUndefined();
    expect(new Headers(contactUpsert?.[1]?.headers).get("Authorization")).toBe("Bearer private-token");
    expect(new Headers(contactUpsert?.[1]?.headers).get("Version")).toBe("v3");
    expect(JSON.parse(String(createOpportunity?.[1]?.body)).name).toBe("Taylor Example — Buyer Inquiry");
    expect(new URL(String(opportunitySearch?.[0])).searchParams.get("status")).toBe("all");
  });

  it("assigns exactly one channel source tag for each acquisition source", async () => {
    fetchMock.mockImplementation(async (input, init) => {
      const url = new URL(String(input));
      if (url.pathname === "/contacts/upsert") return Response.json({ contact: { id: "contact-1" } });
      if (url.pathname.endsWith("/tags")) return Response.json({ success: true });
      if (url.pathname === "/opportunities/search") return Response.json({ opportunities: [] });
      if (url.pathname === "/opportunities/" && init?.method === "POST") return Response.json({ opportunity: { id: "opportunity-1" } });
      return new Response("unexpected", { status: 404 });
    });
    const provider = new GHLProvider({ privateIntegrationToken: "token", locationId: "location-1", pipelineId: "pipeline-1", newLeadStageId: "stage-new" });
    const sourceCases: Array<[LeadSource, string]> = [
      ["landing_form", "source:website"],
      ["property_inquiry", "source:property-inquiry"],
      ["ai_chat", "source:ai-chat"],
      ["booking", "source:booking"],
    ];

    for (const [source] of sourceCases) await provider.syncLead(makeLead(source));

    const tagCalls = fetchMock.mock.calls.filter(([input, init]) => new URL(String(input)).pathname.endsWith("/tags") && init?.method === "POST");
    expect(tagCalls.map(([, init]) => JSON.parse(String(init?.body)).tags)).toEqual(
      sourceCases.map(([, sourceTag]) => ["source:aster-homes", sourceTag, "buyer:primary-residence"]),
    );
  });

  it("adds the marketing consent tag only after explicit opt-in", async () => {
    fetchMock.mockImplementation(async (input, init) => {
      const url = new URL(String(input));
      if (url.pathname === "/contacts/upsert") return Response.json({ contact: { id: "contact-1" } });
      if (url.pathname.endsWith("/tags")) return Response.json({ success: true });
      if (url.pathname === "/opportunities/search") return Response.json({ opportunities: [] });
      if (url.pathname === "/opportunities/" && init?.method === "POST") return Response.json({ opportunity: { id: "opportunity-1" } });
      return new Response("unexpected", { status: 404 });
    });
    const provider = new GHLProvider({ privateIntegrationToken: "token", locationId: "location-1", pipelineId: "pipeline-1", newLeadStageId: "stage-new" });
    const lead = { ...makeLead(), marketing_opt_in: true };

    await provider.syncLead(lead);

    const addedTagsCall = fetchMock.mock.calls.find(([input, init]) => new URL(String(input)).pathname.endsWith("/tags") && init?.method === "POST");
    expect(JSON.parse(String(addedTagsCall?.[1]?.body)).tags).toContain("consent:marketing-email");
  });

  it("updates an existing opportunity without moving it or reopening its status", async () => {
    fetchMock.mockImplementation(async (input, init) => {
      const url = new URL(String(input));
      if (url.pathname === "/contacts/upsert") return Response.json({ contact: { id: "contact-1" } });
      if (url.pathname.endsWith("/tags")) return Response.json({ success: true });
      if (url.pathname === "/opportunities/search") return Response.json({ opportunities: [{ id: "opportunity-existing", name: "Taylor Example — Buyer Inquiry", pipelineStageId: "stage-won", status: "won" }] });
      if (url.pathname === "/opportunities/opportunity-existing" && init?.method === "PUT") return Response.json({ opportunity: { id: "opportunity-existing" } });
      return new Response("unexpected", { status: 404 });
    });
    const provider = new GHLProvider({ privateIntegrationToken: "token", locationId: "location-1", pipelineId: "pipeline-1", newLeadStageId: "stage-new" });

    const result = await provider.syncLead(makeLead());
    const update = fetchMock.mock.calls.find(([input, init]) => new URL(String(input)).pathname === "/opportunities/opportunity-existing" && init?.method === "PUT");

    expect(result.status).toBe("synced");
    expect(JSON.parse(String(update?.[1]?.body)).pipelineStageId).toBe("stage-won");
    expect(JSON.parse(String(update?.[1]?.body)).status).toBeUndefined();
    expect(fetchMock.mock.calls.some(([input, init]) => new URL(String(input)).pathname === "/opportunities/" && init?.method === "POST")).toBe(false);
  });

  it("reports a partial contact sync when the opportunity service fails", async () => {
    fetchMock.mockImplementation(async (input) => {
      const url = new URL(String(input));
      if (url.pathname === "/contacts/upsert") return Response.json({ contact: { id: "contact-1" } });
      if (url.pathname.endsWith("/tags")) return Response.json({ success: true });
      return new Response("unavailable", { status: 503 });
    });
    const provider = new GHLProvider({ privateIntegrationToken: "token", locationId: "location-1", pipelineId: "pipeline-1", newLeadStageId: "stage-new" });
    expect(await provider.syncLead(makeLead())).toEqual({ status: "partial", contact_id: "contact-1" });
  });

  it("maps contact qualification and attribution into configured GHL custom fields", async () => {
    fetchMock.mockImplementation(async (input, init) => {
      const url = new URL(String(input));
      if (url.pathname === "/contacts/upsert") return Response.json({ contact: { id: "contact-1" } });
      if (url.pathname.endsWith("/tags")) return Response.json({ success: true });
      if (url.pathname === "/opportunities/search") return Response.json({ opportunities: [] });
      if (url.pathname === "/opportunities/" && init?.method === "POST") return Response.json({ opportunity: { id: "opportunity-1" } });
      return new Response("unexpected", { status: 404 });
    });
    const provider = new GHLProvider({
      privateIntegrationToken: "token",
      locationId: "location-1",
      pipelineId: "pipeline-1",
      newLeadStageId: "stage-new",
      fields: { buyerIntent: "buyer-intent-id", budgetRange: "budget-id", propertyId: "property-id" },
    });

    await provider.syncLead(makeLead());

    const contactUpsert = fetchMock.mock.calls.find(([input]) => new URL(String(input)).pathname === "/contacts/upsert");
    expect(JSON.parse(String(contactUpsert?.[1]?.body)).customFields).toEqual([
      { id: "buyer-intent-id", fieldValue: "Primary residence" },
      { id: "budget-id", fieldValue: "Under $150k" },
    ]);
  });

  it("stores lead and opportunity IDs after the opportunity exists for workflow handoff", async () => {
    fetchMock.mockImplementation(async (input, init) => {
      const url = new URL(String(input));
      if (url.pathname === "/contacts/upsert") return Response.json({ contact: { id: "contact-1" } });
      if (url.pathname.endsWith("/tags")) return Response.json({ success: true });
      if (url.pathname === "/opportunities/search") return Response.json({ opportunities: [] });
      if (url.pathname === "/opportunities/" && init?.method === "POST") return Response.json({ opportunity: { id: "opportunity-1" } });
      if (url.pathname === "/contacts/contact-1" && init?.method === "PUT") return Response.json({ succeeded: true });
      return new Response("unexpected", { status: 404 });
    });
    const provider = new GHLProvider({
      privateIntegrationToken: "token",
      locationId: "location-1",
      pipelineId: "pipeline-1",
      newLeadStageId: "stage-new",
      fields: { iAcquireLeadId: "lead-id-field", iAcquireOpportunityId: "opportunity-id-field" },
    });

    expect(await provider.syncLead(makeLead())).toEqual({ status: "synced", contact_id: "contact-1", opportunity_id: "opportunity-1" });
    const calls = fetchMock.mock.calls;
    const opportunityCreateIndex = calls.findIndex(([input, init]) => new URL(String(input)).pathname === "/opportunities/" && init?.method === "POST");
    const integrationFieldsIndex = calls.findIndex(([input, init]) => new URL(String(input)).pathname === "/contacts/contact-1" && init?.method === "PUT");
    expect(opportunityCreateIndex).toBeGreaterThanOrEqual(0);
    expect(integrationFieldsIndex).toBeGreaterThan(opportunityCreateIndex);
    const customFields = JSON.parse(String(calls[integrationFieldsIndex]?.[1]?.body)).customFields;
    expect(customFields).toEqual([
      { id: "lead-id-field", fieldValue: "lead-1" },
      { id: "opportunity-id-field", fieldValue: "opportunity-1" },
    ]);
  });

  it("writes canonical AI result fields for HighLevel workflows to route", async () => {
    fetchMock.mockImplementation(async (input, init) => {
      const url = new URL(String(input));
      if (url.pathname === "/contacts/contact-1" && init?.method === "PUT") return Response.json({ succeeded: true });
      return new Response("unexpected", { status: 404 });
    });
    const provider = new GHLProvider({
      privateIntegrationToken: "token",
      locationId: "location-1",
      qualifiedStageId: "stage-qualified",
      fields: { iAcquireLeadScore: "score-id", iAcquireLeadTemperature: "temperature-id", iAcquireAiSummary: "summary-id" },
    });
    const lead = { ...makeLead(), crm: { status: "synced" as const, contact_id: "contact-1", opportunity_id: "opportunity-1", updated_at: "2026-09-27T12:00:00.000Z" } };

    const result = await provider.updateQualification(lead, {
      status: "qualified", score: 88, temperature: "hot", summary: "Ready for a call.",
    });
    const contactUpdate = fetchMock.mock.calls.find(([input]) => new URL(String(input)).pathname === "/contacts/contact-1");

    expect(result.status).toBe("synced");
    expect(JSON.parse(String(contactUpdate?.[1]?.body)).customFields).toEqual([
      { id: "score-id", fieldValue: 88 },
      { id: "temperature-id", fieldValue: "HOT" },
      { id: "summary-id", fieldValue: "Ready for a call." },
    ]);
    expect(fetchMock.mock.calls).toHaveLength(1);
  });
});
