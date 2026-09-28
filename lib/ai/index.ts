import "server-only";
import { isDemoMode } from "@/lib/config";
import { DemoAIProvider } from "./demo-provider";
import { OpenAICompatibleAIProvider } from "./openai-compatible-provider";
import type { AIProvider } from "./types";

export function getAIProvider(): AIProvider {
  if (isDemoMode()) return new DemoAIProvider();
  const apiKey = process.env.AI_API_KEY?.trim();
  const baseUrl = process.env.AI_BASE_URL?.trim();
  const model = process.env.AI_MODEL?.trim();
  if (!apiKey || !baseUrl || !model) return new DemoAIProvider();
  try {
    if (new URL(baseUrl).protocol !== "https:") return new DemoAIProvider();
  } catch {
    return new DemoAIProvider();
  }
  return new OpenAICompatibleAIProvider({ apiKey, baseUrl, model });
}
