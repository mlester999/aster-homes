import type { NormalizedLead } from "@/types/lead";

export interface AIConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AILeadQualification {
  score: number;
  status: "qualified" | "needs_review";
  reason: string;
  summary: string;
  recommended_action: string;
  follow_up_strategy: string;
}

export interface AIProvider {
  readonly mode: "guided" | "configured";
  answerQuestion(question: string, context: AIConversationMessage[]): Promise<string>;
  qualifyLead?(lead: NormalizedLead): Promise<AILeadQualification>;
}
