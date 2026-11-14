import { NextRequest, NextResponse } from "next/server";
import { auditInputSchema } from "@/lib/schemas/audit-input";
import { validateAndNormalizeUrl } from "@/lib/security/url-validation";
import { verifyTurnstileToken } from "@/lib/security/turnstile";
import { consumeRateLimitQuota } from "@/lib/security/rate-limit";
import { executeAuditPipeline } from "@/lib/report/assemble";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow sufficient time for crawl & providers

export async function POST(req: NextRequest) {
  try {
    // 1. Parse JSON body
    let rawBody: any;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
    }

    // 2. Validate input schema
    const parseResult = auditInputSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0]?.message || "Invalid input parameters";
      return NextResponse.json({ error: issue }, { status: 400 });
    }

    const { url, turnstileToken } = parseResult.data;

    // 3. Normalize & check URL format / SSRF safety
    const urlValidation = validateAndNormalizeUrl(url);
    if (!urlValidation.valid || !urlValidation.normalizedUrl || !urlValidation.origin || !urlValidation.host) {
      return NextResponse.json(
        { error: urlValidation.error || "Enter a valid public website URL beginning with http:// or https://" },
        { status: 400 }
      );
    }

    // 4. Client IP & Abuse Controls
    const forwarded = req.headers.get("x-forwarded-for");
    const clientIp = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";

    // Turnstile challenge verification
    const turnstileCheck = await verifyTurnstileToken(turnstileToken, clientIp);
    if (!turnstileCheck.success) {
      return NextResponse.json({ error: turnstileCheck.error }, { status: 403 });
    }

    // Atomic Rate Limiting
    const quotaCheck = await consumeRateLimitQuota(clientIp);
    if (!quotaCheck.allowed) {
      const message =
        quotaCheck.reason === "global_limit_exceeded"
          ? "Daily global audit limit reached. Please check back tomorrow."
          : "You have reached your daily free audit allowance (2 audits per day).";
      return NextResponse.json({ error: message }, { status: 429 });
    }

    // 5. Execute Audit Pipeline
    const pipelineResult = await executeAuditPipeline(
      url,
      urlValidation.normalizedUrl,
      urlValidation.origin,
      urlValidation.host
    );

    return NextResponse.json({
      status: pipelineResult.status,
      reportUrl: pipelineResult.reportUrl,
      expiresAt: pipelineResult.expiresAt,
    });
  } catch (err: any) {
    console.error("Audit execution error:", err);

    const errorMessage = err.message || "An unexpected error occurred while processing the audit";
    const statusCode = errorMessage.includes("robots.txt")
      ? 403
      : errorMessage.includes("timed out")
      ? 504
      : errorMessage.includes("Security validation") || errorMessage.includes("private")
      ? 400
      : 502;

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
