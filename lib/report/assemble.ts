import crypto from "node:crypto";
import { crawlSite } from "@/lib/crawler/discover";
import { generateFindings } from "@/lib/audit/findings";
import { calculateCategoryScores } from "@/lib/audit/scoring";
import { runPageSpeedAudit } from "@/lib/providers/pagespeed";
import { generateGeminiRecommendations } from "@/lib/providers/gemini";
import { saveAuditReport } from "@/lib/supabase/server";
import { AuditReport } from "@/lib/schemas/audit-report";
import { getEnv } from "@/lib/env";

export interface OrchestrationResult {
  reportUrl: string;
  token: string;
  expiresAt: string;
  status: "completed" | "partial" | "failed";
}

/**
 * Generates a high-entropy random token (192 bits / 24 bytes) base64url encoded.
 */
export function generateReportToken(): string {
  return crypto.randomBytes(24).toString("base64url");
}

/**
 * Computes SHA-256 hex digest of a bearer token.
 */
export function hashReportToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Executes the complete audit pipeline:
 * Crawl -> Deterministic Checks -> PageSpeed -> Gemini -> Save Report.
 */
export async function executeAuditPipeline(
  submittedUrl: string,
  normalizedUrl: string,
  origin: string,
  host: string
): Promise<OrchestrationResult> {
  const env = getEnv();
  const auditId = crypto.randomUUID();
  const token = generateReportToken();
  const tokenHash = hashReportToken(token);

  const createdAt = new Date().toISOString();
  const expiresDate = new Date();
  expiresDate.setDate(expiresDate.getDate() + (env.REPORT_TTL_DAYS || 7));
  const expiresAt = expiresDate.toISOString();

  // 1. Crawl website (up to 5 pages, same origin, robots.txt aware)
  const crawlResult = await crawlSite(normalizedUrl, origin);
  const { pages, crawlMetadata } = crawlResult;

  // 2. Deterministic Checks & Findings Aggregation
  const { findings, counts } = generateFindings(pages);

  // 3. Parallel external calls: PageSpeed (landing page) + Gemini
  const [pagespeedResult, geminiResult] = await Promise.all([
    runPageSpeedAudit(normalizedUrl),
    generateGeminiRecommendations(pages, findings),
  ]);

  // 4. Score Calculation
  const { categoryScores, heuristicScore } = calculateCategoryScores(
    findings,
    pages.length,
    pagespeedResult.performanceScore
  );

  // 5. Determine overall audit status
  let status: "completed" | "partial" | "failed" = "completed";
  if (pagespeedResult.status === "failed" || geminiResult.status === "failed") {
    status = "partial";
  }

  // 6. Compile Summary
  const executiveSummary =
    geminiResult.output?.executive_summary ||
    `Audit completed for ${host}. Crawled ${pages.length} page(s), discovered ${counts.high} high-priority and ${counts.medium} medium-priority items.`;

  const report: AuditReport = {
    id: auditId,
    public_token: token,
    submitted_url: submittedUrl,
    normalized_url: normalizedUrl,
    host,
    status,
    created_at: createdAt,
    completed_at: new Date().toISOString(),
    expires_at: expiresAt,
    summary: {
      executive_summary: executiveSummary,
      pages_crawled: pages.length,
      high_count: counts.high,
      medium_count: counts.medium,
      low_count: counts.low,
      info_count: counts.info,
      heuristic_score: heuristicScore,
    },
    category_scores: categoryScores,
    provider_status: {
      pagespeed: {
        status: pagespeedResult.status,
        error: pagespeedResult.error,
        categories: pagespeedResult.categories,
        metrics: pagespeedResult.metrics,
      },
      gemini: {
        status: geminiResult.status,
        error: geminiResult.error,
      },
    },
    crawl_metadata: crawlMetadata,
    pages,
    findings,
    recommendations: geminiResult.output?.recommendations || [],
    content_observations: geminiResult.output?.content_observations || [],
    limitations: [
      ...(geminiResult.output?.limitations || []),
      ...(crawlMetadata.crawl_limitations || []),
    ],
  };

  // 7. Persist to database (or in-memory cache)
  await saveAuditReport(report, tokenHash);

  return {
    reportUrl: `/report/${token}`,
    token,
    expiresAt,
    status,
  };
}
