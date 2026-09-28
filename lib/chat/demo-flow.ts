import { z } from "zod";
import { budgetRanges, buyerIntents, bedroomOptions, financingStatuses, propertyTypes, purchaseTimelines } from "@/types/lead";
import { chatOptions } from "./options";

export const chatStepSchema = z.enum(["intent", "budget", "property_type", "bedrooms", "location", "timeline", "financing", "next_step", "contact"]);

export const chatStateSchema = z.object({
  step: chatStepSchema,
  answers: z.object({
    intent: z.enum(buyerIntents).optional(),
    budget_range: z.enum(budgetRanges).optional(),
    property_type: z.enum(propertyTypes).optional(),
    bedrooms: z.enum(bedroomOptions).optional(),
    preferred_location: z.string().trim().max(120).optional(),
    timeline: z.enum(purchaseTimelines).optional(),
    financing_status: z.enum(financingStatuses).optional(),
  }).strict(),
}).strict();

export type ChatState = z.infer<typeof chatStateSchema>;
export type ChatStep = ChatState["step"];

export const chatEventSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("answer"), value: z.string().trim().min(1).max(160) }).strict(),
  z.object({ kind: z.literal("question"), value: z.string().trim().min(1).max(500) }).strict(),
  z.object({ kind: z.literal("request_contact") }).strict(),
]);

export type ChatEvent = z.infer<typeof chatEventSchema>;

export interface ChatSuggestion {
  value: string;
  label: string;
}

export interface ChatTurnResult {
  state: ChatState;
  assistant_message: string;
  suggestions: ChatSuggestion[];
  assistant_mode: "guided" | "configured" | "unavailable";
}

type GuidedStep = Exclude<ChatStep, "next_step" | "contact">;

const questions: Record<GuidedStep, { prompt: string; options?: readonly ChatSuggestion[] }> = {
  intent: { prompt: "Are you looking for a home to live in, an investment, or something else?", options: chatOptions.intent },
  budget: { prompt: "What budget range feels comfortable for your search?", options: chatOptions.budget },
  property_type: { prompt: "What type of home do you have in mind?", options: chatOptions.propertyType },
  bedrooms: { prompt: "How many bedrooms would suit you?", options: chatOptions.bedrooms },
  location: { prompt: "Where would you ideally like to live? You can name a neighborhood or say ‘Open to options.’" },
  timeline: { prompt: "When are you hoping to make a move?", options: chatOptions.timeline },
  financing: { prompt: "Where are you with financing? I can note if you’d like assistance, but can’t assess or guarantee loan approval.", options: chatOptions.financing },
};

const nextStep: Record<GuidedStep, ChatStep> = {
  intent: "budget",
  budget: "property_type",
  property_type: "bedrooms",
  bedrooms: "location",
  location: "timeline",
  timeline: "financing",
  financing: "next_step",
};

function isOneOf(value: string, options: readonly { value: string }[]): boolean {
  return options.some((option) => option.value === value);
}

function stateWithAnswer(state: ChatState, event: ChatEvent): ChatState | null {
  if (event.kind !== "answer" || state.step === "next_step" || state.step === "contact") return null;
  const value = event.value.trim().slice(0, 120);
  const step = state.step;
  const answerMaps: Record<GuidedStep, { key: keyof ChatState["answers"]; choices?: readonly ChatSuggestion[] }> = {
    intent: { key: "intent", choices: chatOptions.intent },
    budget: { key: "budget_range", choices: chatOptions.budget },
    property_type: { key: "property_type", choices: chatOptions.propertyType },
    bedrooms: { key: "bedrooms", choices: chatOptions.bedrooms },
    location: { key: "preferred_location" },
    timeline: { key: "timeline", choices: chatOptions.timeline },
    financing: { key: "financing_status", choices: chatOptions.financing },
  };
  const mapping = answerMaps[step];
  if (mapping.choices && !isOneOf(value, mapping.choices)) return null;
  if (step === "location" && value.length < 2) return null;
  return { step: nextStep[step], answers: { ...state.answers, [mapping.key]: value } as ChatState["answers"] };
}

function suggestionsFor(step: ChatStep): ChatSuggestion[] {
  return step in questions ? [...(questions[step as GuidedStep].options ?? [])] : [];
}

export async function processChatTurn(
  state: ChatState,
  event: ChatEvent,
  answerQuestion: (question: string) => Promise<{ answer: string; mode: "guided" | "configured" }>,
): Promise<ChatTurnResult> {
  if (event.kind === "question") {
    try {
      const result = await answerQuestion(event.value);
      return { state, assistant_message: result.answer, suggestions: suggestionsFor(state.step), assistant_mode: result.mode };
    } catch {
      return {
        state,
        assistant_message: "I’m having trouble answering that just now. You can still continue with the home-search questions below.",
        suggestions: suggestionsFor(state.step),
        assistant_mode: "unavailable",
      };
    }
  }

  if (event.kind === "request_contact") {
    if (state.step !== "next_step") {
      return {
        state,
        assistant_message: state.step === "contact" ? "Use the short form below to send your request." : "Let’s first gather a few details so an advisor has a useful starting point.",
        suggestions: suggestionsFor(state.step),
        assistant_mode: "guided",
      };
    }
    return {
      state: { ...state, step: "contact" },
      assistant_message: "I can prepare that request. Share your name, email, and phone, and confirm you’d like Aster Homes to contact you about this inquiry.",
      suggestions: [],
      assistant_mode: "guided",
    };
  }

  const updated = stateWithAnswer(state, event);
  if (!updated) {
    if (state.step === "next_step") {
      return { state, assistant_message: "An advisor can confirm current property options, pricing, and availability. You can request a conversation or book a consultation below.", suggestions: [], assistant_mode: "guided" };
    }
    if (state.step === "contact") {
      return { state, assistant_message: "Use the short form below to send your request.", suggestions: [], assistant_mode: "guided" };
    }
    return { state, assistant_message: `Please choose one of these options, or tell me a little more. ${questions[state.step].prompt}`, suggestions: suggestionsFor(state.step), assistant_mode: "guided" };
  }

  if (updated.step === "next_step") {
    return {
      state: updated,
      assistant_message: "Thanks — I have a useful starting point for your search. An advisor can confirm current property options, pricing, and availability.",
      suggestions: [],
      assistant_mode: "guided",
    };
  }

  if (updated.step === "contact") {
    return { state: updated, assistant_message: "Use the short form below to send your request.", suggestions: [], assistant_mode: "guided" };
  }

  return { state: updated, assistant_message: questions[updated.step].prompt, suggestions: suggestionsFor(updated.step), assistant_mode: "guided" };
}
