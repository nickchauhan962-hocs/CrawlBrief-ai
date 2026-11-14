import { describe, it, expect } from "vitest";
import { generateReportToken, hashReportToken } from "@/lib/report/assemble";
import { saveAuditReport, getAuditReportByTokenHash } from "@/lib/supabase/server";
import { AuditReport } from "@/lib/schemas/audit-report";

describe("Report Token & Pipeline Operations", () => {
  it("generates high entropy 24-byte base64url tokens", () => {
    const token = generateReportToken();
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThanOrEqual(32); // 24 bytes in base64url is 32 chars
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("produces deterministic SHA-256 hashes", () => {
    const token = "my-test-token-1234567890";
    const hash1 = hashReportToken(token);
    const hash2 = hashReportToken(token);
    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64); // 64 hex chars
  });

  it("stores and retrieves reports via token hash", async () => {
    const token = generateReportToken();
    const tokenHash = hashReportToken(token);

    const mockReport: AuditReport = {
      id: "test-uuid-1",
      submitted_url: "https://example.com",
      normalized_url: "https://example.com/",
      host: "example.com",
      status: "completed",
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 86400 * 1000).toISOString(),
      summary: {
        executive_summary: "Healthy test site summary.",
        pages_crawled: 1,
        high_count: 0,
        medium_count: 1,
        low_count: 0,
        info_count: 0,
        heuristic_score: 90,
      },
      category_scores: {
        technical: { score: 90, status: "good", passed: 8, issues: 1 },
      },
      provider_status: {
        pagespeed: { status: "skipped" },
        gemini: { status: "skipped" },
      },
      crawl_metadata: {
        pages_attempted: 1,
        pages_fetched: 1,
        robots_status: "robots.txt parsed",
        crawl_limitations: [],
      },
      pages: [],
      findings: [],
      recommendations: [],
      content_observations: [],
      limitations: [],
    };

    await saveAuditReport(mockReport, tokenHash);

    const retrieved = await getAuditReportByTokenHash(tokenHash);
    expect(retrieved).toBeDefined();
    expect(retrieved?.host).toBe("example.com");
    expect(retrieved?.summary.heuristic_score).toBe(90);

    // Invalid hash should return null
    const nonExistent = await getAuditReportByTokenHash("invalid_hash_string");
    expect(nonExistent).toBeNull();
  });
});
