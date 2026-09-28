import type { LeadInput } from "./schema";

export function temperatureForScore(score: number): "hot" | "warm" | "cold" {
  return score >= 70 ? "hot" : score >= 42 ? "warm" : "cold";
}

export function scoreDemoLead(lead: Pick<LeadInput, "timeline" | "intent">) {
  const timelineScore: Record<LeadInput["timeline"], number> = {
    asap: 78,
    within_30_days: 70,
    one_to_three_months: 58,
    three_to_six_months: 46,
    six_plus_months: 34,
    exploring: 20,
  };
  const activeIntent = lead.intent === "exploring" ? 0 : 8;
  const score = Math.min(100, timelineScore[lead.timeline] + activeIntent);
  const temperature = temperatureForScore(score);
  return {
    status: "demo" as const,
    score,
    temperature,
    summary: "Development-only priority estimate based on stated purchase timing and intent.",
  };
}
