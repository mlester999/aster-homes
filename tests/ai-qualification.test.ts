import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OpenAICompatibleAIProvider } from "@/lib/ai/openai-compatible-provider";
import { createNormalizedLead } from "@/lib/leads/service";
import { leadInputSchema } from "@/lib/leads/schema";

const fetchMock = vi.fn<typeof fetch>();

function makeLead() {
  return createNormalizedLead(leadInputSchema.parse({
    source: "property_inquiry",
    full_name: "Taylor Example",
    email: "taylor@example.test",
    phone: "+1 555 010 0200",
    intent: "primary_residence",
    property_type: "house",
    budget_range: "500_plus",
    timeline: "one_to_three_months",
    financing_status: "pre_approved",
    bedrooms: "3",
    preferred_location: "Northhaven",
    notes: "Needs a quiet office space.",
    consent_to_contact: true,
    marketing_opt_in: true,
  }), new Date("2026-09-27T12:00:00.000Z"), "lead-test-1", false);
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => vi.unstubAllGlobals());

describe("server-side AI qualification", () => {
  it("requests structured priority and narrative without sending direct contact identifiers", async () => {
    fetchMock.mockResolvedValue(Response.json({ choices: [{ message: { content: JSON.stringify({
      score: 76,
      status: "qualified",
      reason: "The visitor stated a near-term purchase timeline.",
      summary: "Searching for a three-bedroom house and quiet office space.",
      recommended_action: "Offer a consultation and confirm current options.",
      follow_up_strategy: "A salesperson should follow up promptly.",
    }) } }] }));
    const provider = new OpenAICompatibleAIProvider({ apiKey: "server-secret", baseUrl: "https://ai.example/v1", model: "qualification-model" });

    const result = await provider.qualifyLead(makeLead());
    const [url, init] = fetchMock.mock.calls[0];
    const requestBody = JSON.parse(String(init?.body));
    const requestText = JSON.stringify(requestBody.messages);

    expect(String(url)).toBe("https://ai.example/v1/chat/completions");
    expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer server-secret");
    expect(requestBody.response_format).toEqual({ type: "json_object" });
    expect(requestText).not.toContain("Taylor Example");
    expect(requestText).not.toContain("taylor@example.test");
    expect(requestText).not.toContain("15550100200");
    expect(result).toMatchObject({ score: 76, status: "qualified", reason: expect.any(String) });
  });

  it("rejects malformed structured output rather than saving an invalid score", async () => {
    fetchMock.mockResolvedValue(Response.json({ choices: [{ message: { content: JSON.stringify({
      score: 101,
      status: "qualified",
      reason: "Too high.",
      summary: "Summary.",
      recommended_action: "Call.",
      follow_up_strategy: "Soon.",
    }) } }] }));
    const provider = new OpenAICompatibleAIProvider({ apiKey: "server-secret", baseUrl: "https://ai.example/v1", model: "qualification-model" });

    await expect(provider.qualifyLead(makeLead())).rejects.toThrow("invalid qualification result");
  });
});
