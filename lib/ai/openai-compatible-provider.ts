import "server-only";
import { z } from "zod";
import type { NormalizedLead } from "@/types/lead";
import type { AIConversationMessage, AILeadQualification, AIProvider } from "./types";

interface CompatibleResponse {
  choices?: Array<{ message?: { content?: string | Array<{ type?: string; text?: string }> } }>;
}

export class OpenAICompatibleAIProvider implements AIProvider {
  readonly mode = "configured" as const;

  constructor(private readonly config: { apiKey: string; baseUrl: string; model: string }) {}

  async answerQuestion(question: string, context: AIConversationMessage[]) {
    const base = new URL(this.config.baseUrl.endsWith("/") ? this.config.baseUrl : `${this.config.baseUrl}/`);
    const endpoint = new URL("chat/completions", base);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        temperature: 0.2,
        max_tokens: 350,
        messages: [
          {
            role: "system",
            content: "You are Aster Assistant, a concise and warm home-search guide for Aster Homes. The site has no live property catalog or verified listing data. Never invent or claim specific homes, prices, availability, addresses, licensing, financing approval, legal advice, investment returns, or financial advice. For current property details, offer to connect the visitor with an advisor. Help visitors share preferences and explain general home-buying steps. Do not ask for sensitive financial-account information.",
          },
          ...context.slice(-6),
          { role: "user", content: question },
        ],
      }),
      signal: AbortSignal.timeout(12000),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`AI provider request failed (${response.status})`);
    const data = await response.json() as CompatibleResponse;
    const content = data.choices?.[0]?.message?.content;
    const answer = typeof content === "string" ? content : content?.map((part) => part.text ?? "").join("");
    if (!answer?.trim()) throw new Error("AI provider returned no assistant message");
    return answer.trim().slice(0, 1200);
  }

  async qualifyLead(lead: NormalizedLead): Promise<AILeadQualification> {
    const base = new URL(this.config.baseUrl.endsWith("/") ? this.config.baseUrl : `${this.config.baseUrl}/`);
    const endpoint = new URL("chat/completions", base);
    const resultSchema = z.object({
      score: z.number().int().min(0).max(100),
      status: z.enum(["qualified", "needs_review"]),
      reason: z.string().trim().min(1).max(500),
      summary: z.string().trim().min(1).max(800),
      recommended_action: z.string().trim().min(1).max(500),
      follow_up_strategy: z.string().trim().min(1).max(500),
    }).strict();

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        temperature: 0.1,
        max_tokens: 700,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: [
              "You qualify residential property inquiries only to prioritize a human sales response; this is not a housing, lending, or legal eligibility decision.",
              "Return one JSON object with score (integer 0–100), status (qualified or needs_review), reason, summary, recommended_action, and follow_up_strategy.",
              "Use only the visitor's stated purchase timeline and stated level of intent to set follow-up urgency. Never score or disqualify using name, contact details, precise location, protected traits, budget, financing status, or inferred wealth.",
              "A valid inquiry must not be disqualified. Use needs_review for unclear or exploratory intent. Do not invent facts, listing details, availability, loan approval, or promises.",
              "Score bands: 70–100 HOT, 42–69 WARM, 0–41 COLD. Recommend a human review for low-signal inquiries; use a calm, low-frequency follow-up strategy for COLD.",
              "Keep every text field concise, factual, and useful to an advisor.",
            ].join(" "),
          },
          {
            role: "user",
            content: JSON.stringify({
              intent: lead.intent,
              property_type: lead.property_type,
              timeline: lead.timeline,
              preferred_location: lead.preferred_location,
              bedrooms: lead.bedrooms,
              budget_range: lead.budget_range,
              financing_status: lead.financing_status,
              notes: lead.notes,
              marketing_opt_in: lead.marketing_opt_in,
            }),
          },
        ],
      }),
      signal: AbortSignal.timeout(15000),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`AI provider request failed (${response.status})`);
    const data = await response.json() as CompatibleResponse;
    const content = data.choices?.[0]?.message?.content;
    const json = typeof content === "string" ? content : content?.map((part) => part.text ?? "").join("");
    if (!json?.trim()) throw new Error("AI provider returned no qualification result");
    const parsed = resultSchema.safeParse(JSON.parse(json));
    if (!parsed.success) throw new Error("AI provider returned an invalid qualification result");
    return parsed.data;
  }
}
