import { NextResponse } from "next/server";
import { getAIProvider } from "@/lib/ai";
import type { AIConversationMessage } from "@/lib/ai/types";
import { chatEventSchema, chatStateSchema, processChatTurn } from "@/lib/chat/demo-flow";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { isSameOriginRequest } from "@/lib/security/origin";
import { readJsonRequest } from "@/lib/security/read-json-request";
import { z } from "zod";

export const runtime = "nodejs";

const requestSchema = z.object({
  state: chatStateSchema,
  event: chatEventSchema,
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(1200) }).strict()).max(12).default([]),
}).strict();

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "This request could not be accepted." }, { status: 403 });
  const limit = checkRateLimit(request, "chat-turn", 45, 60 * 60 * 1000);
  if (!limit.allowed) return NextResponse.json({ error: "The assistant needs a short pause. Try again in a moment." }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } });

  const body = await readJsonRequest(request, 16000);
  if (!body.ok) return NextResponse.json({ error: body.status === 413 ? "That message is too large. Please try a shorter message." : "Please try sending that again." }, { status: body.status });

  const parsed = requestSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "That message could not be processed. Please try again." }, { status: 400 });

  const provider = getAIProvider();
  const history: AIConversationMessage[] = parsed.data.history.slice(-8);
  const result = await processChatTurn(parsed.data.state, parsed.data.event, async (question) => ({
    answer: await provider.answerQuestion(question, history),
    mode: provider.mode,
  }));
  return NextResponse.json(result);
}
