import { describe, expect, it } from "vitest";
import { homeStyleCards } from "@/lib/properties/data";
import { processChatTurn, type ChatState } from "@/lib/chat/demo-flow";
import { chatOptions } from "@/lib/chat/options";
import { DemoAIProvider } from "@/lib/ai/demo-provider";

describe("home-search entry points", () => {
  it("offers home styles without exposing invented listing details", () => {
    expect(homeStyleCards.map((style) => style.property_type)).toEqual(["house", "condo", "townhouse"]);
    expect(JSON.stringify(homeStyleCards)).not.toMatch(/price|address|listing/i);
  });
});

describe("guided chat qualification flow", () => {
  it("collects preferences and routes to the advisor contact form", async () => {
    let state: ChatState = { step: "intent", answers: {} };
    const values = [
      chatOptions.intent[1].value,
      chatOptions.budget[0].value,
      chatOptions.propertyType[1].value,
      chatOptions.bedrooms[0].value,
      "Northhaven",
      chatOptions.timeline[1].value,
      chatOptions.financing[1].value,
    ];
    let lastTurn = await processChatTurn(state, { kind: "answer", value: values[0] }, async () => ({ answer: "guided", mode: "guided" }));
    state = lastTurn.state;
    for (const value of values.slice(1)) {
      lastTurn = await processChatTurn(state, { kind: "answer", value }, async () => ({ answer: "guided", mode: "guided" }));
      state = lastTurn.state;
    }

    expect(state.step).toBe("next_step");
    expect(state.answers.preferred_location).toBe("Northhaven");
    expect(lastTurn.assistant_mode).toBe("guided");
    expect(lastTurn.assistant_message).toContain("current property options");

    const handoff = await processChatTurn(state, { kind: "request_contact" }, async () => ({ answer: "guided", mode: "guided" }));
    expect(handoff.state.step).toBe("contact");
  });

  it("answers availability questions without inventing a listing", async () => {
    const provider = new DemoAIProvider();
    const question = await processChatTurn(
      { step: "intent", answers: {} },
      { kind: "question", value: "Are your properties available now?" },
      async (value) => ({ answer: await provider.answerQuestion(value), mode: provider.mode }),
    );

    expect(question.assistant_mode).toBe("guided");
    expect(question.assistant_message).toContain("does not show a live property catalog");
    expect(question).not.toHaveProperty("recommendations");
  });

  it("keeps the guided form usable when the configured answer provider fails", async () => {
    const result = await processChatTurn(
      { step: "intent", answers: {} },
      { kind: "question", value: "What can you help me with?" },
      async () => { throw new Error("unavailable"); },
    );
    expect(result.assistant_mode).toBe("unavailable");
    expect(result.suggestions.length).toBeGreaterThan(0);
  });
});
