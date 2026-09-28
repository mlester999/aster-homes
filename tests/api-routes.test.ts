import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NormalizedLead } from "@/types/lead";
import { submitLead } from "@/lib/leads/service";
import { POST as submitLeadRoute } from "@/app/api/leads/route";
import { POST as chatRoute } from "@/app/api/chat/route";

vi.mock("@/lib/leads/service", () => ({
  submitLead: vi.fn(),
  LeadInputError: class LeadInputError extends Error {},
}));

function sameOriginHeaders(ip: string) {
  return { origin: "https://aster.example", host: "aster.example", "x-forwarded-for": ip, "content-type": "application/json" };
}

beforeEach(() => vi.mocked(submitLead).mockReset());
afterEach(() => vi.unstubAllEnvs());

describe("lead submission API", () => {
  it("rejects cross-origin submissions before calling the lead service", async () => {
    const request = new Request("https://aster.example/api/leads", {
      method: "POST",
      headers: { ...sameOriginHeaders("203.0.113.20"), origin: "https://attacker.example" },
      body: "{}",
    });
    const response = await submitLeadRoute(request);

    expect(response.status).toBe(403);
    expect(submitLead).not.toHaveBeenCalled();
  });

  it("returns safe statuses without returning stored contact details", async () => {
    const lead = {
      full_name: "Private Person",
      email: "person@example.test",
      phone: "+15550102000",
      crm: { status: "synced" },
      automation: { status: "triggered" },
      ai_qualification: { status: "demo", score: 72, temperature: "hot" },
    } as unknown as NormalizedLead;
    vi.mocked(submitLead).mockResolvedValue({ lead, duplicate: false, demoMode: true } as Awaited<ReturnType<typeof submitLead>>);
    const request = new Request("https://aster.example/api/leads", { method: "POST", headers: sameOriginHeaders("203.0.113.21"), body: "{}" });

    const response = await submitLeadRoute(request);
    const body = await response.json() as Record<string, unknown>;

    expect(response.status).toBe(201);
    expect(body).toMatchObject({ ok: true, duplicate: false, statuses: { crm: "synced", automation: "triggered", qualification: "demo", score: 72, temperature: "hot" } });
    expect(JSON.stringify(body)).not.toContain("person@example.test");
    expect(JSON.stringify(body)).not.toContain("Private Person");
  });

});

describe("chat API", () => {
  it("uses the guided flow for validated chat turns without exposing provider details", async () => {
    vi.stubEnv("DEMO_MODE", "true");
    const request = new Request("https://aster.example/api/chat", {
      method: "POST",
      headers: sameOriginHeaders("203.0.113.23"),
      body: JSON.stringify({ state: { step: "intent", answers: {} }, event: { kind: "answer", value: "primary_residence" }, history: [] }),
    });

    const response = await chatRoute(request);
    const body = await response.json() as { state: { step: string }; assistant_mode: string; assistant_message: string };

    expect(response.status).toBe(200);
    expect(body.state.step).toBe("budget");
    expect(body.assistant_mode).toBe("guided");
    expect(body.assistant_message).toContain("budget");
  });

  it("rejects invalid chat flow state", async () => {
    const request = new Request("https://aster.example/api/chat", {
      method: "POST", headers: sameOriginHeaders("203.0.113.24"),
      body: JSON.stringify({ state: { step: "unknown", answers: {} }, event: { kind: "answer", value: "primary_residence" }, history: [] }),
    });
    expect((await chatRoute(request)).status).toBe(400);
  });
});
