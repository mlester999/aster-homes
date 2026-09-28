import type { AIProvider } from "./types";

export class DemoAIProvider implements AIProvider {
  readonly mode = "guided" as const;

  async answerQuestion(question: string) {
    const text = question.toLocaleLowerCase();
    if (/real|available|for sale|listing/.test(text)) {
      return "Aster Homes does not show a live property catalog here. An advisor can confirm current availability and details.";
    }
    if (/financ|mortgage|loan|approval/.test(text)) {
      return "I can note that you’d like financing assistance, but I can’t assess or guarantee loan approval. An advisor can help you understand useful next steps.";
    }
    if (/book|appointment|consult|advisor|person/.test(text)) {
      return "You can request a conversation with an advisor at any time. I can first note what you’re looking for, then help prepare that request.";
    }
    if (/price|budget|cost/.test(text)) {
      return "I don’t have live pricing in this chat. If you share a comfortable budget range, I can include it in your advisor request.";
    }
    return "I can help outline your budget, preferred home style, location, timing, and financing questions, then prepare a request for an advisor. What would be most helpful?";
  }
}
