import { NextResponse } from "next/server";
import { LeadInputError, submitLead } from "@/lib/leads/service";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { isSameOriginRequest } from "@/lib/security/origin";
import { readJsonRequest } from "@/lib/security/read-json-request";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "This request could not be accepted." }, { status: 403 });
  const limit = checkRateLimit(request, "lead-submit", 8, 60 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Please wait a little before sending another request." }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } });
  }

  const body = await readJsonRequest(request, 32000);
  if (!body.ok) return NextResponse.json({ error: body.status === 413 ? "The submission is too large." : "Please check the form and try again." }, { status: body.status });

  try {
    const result = await submitLead(body.value);
    return NextResponse.json({
      ok: true,
      duplicate: result.duplicate,
      statuses: {
        crm: result.lead.crm.status,
        automation: result.lead.automation.status,
        qualification: result.lead.ai_qualification.status,
        ...(result.lead.ai_qualification.score !== undefined ? { score: result.lead.ai_qualification.score } : {}),
        ...(result.lead.ai_qualification.temperature ? { temperature: result.lead.ai_qualification.temperature } : {}),
      },
    }, { status: result.duplicate ? 200 : 201 });
  } catch (error) {
    if (error instanceof LeadInputError) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ error: "We couldn’t submit your request just now. Please try again." }, { status: 500 });
  }
}
