import crypto from "node:crypto";
import { Finding, PageFact } from "@/lib/schemas/audit-report";
import { runPageChecks } from "./checks";

export interface AggregateFindingsResult {
  findings: Finding[];
  counts: {
    high: number;
    medium: number;
    low: number;
    info: number;
  };
}

/**
 * Executes deterministic checks across all crawled pages and compiles aggregated findings.
 */
export function generateFindings(pages: PageFact[], sitemaps: string[] = []): AggregateFindingsResult {
  const allFindings: Finding[] = [];

  pages.forEach((page, index) => {
    const pageFindings = runPageChecks({
      page,
      pageIndex: index,
      isLandingPage: index === 0,
      sitemaps,
    });

    pageFindings.forEach((finding) => {
      // Deterministic synthetic finding id
      const hash = crypto
        .createHash("md5")
        .update(`${finding.page_url || ""}:${finding.check_key}:${finding.title}`)
        .digest("hex")
        .slice(0, 16);

      allFindings.push({
        ...finding,
        id: `find_${hash}`,
      });
    });
  });

  const counts = {
    high: allFindings.filter((f) => f.severity === "high").length,
    medium: allFindings.filter((f) => f.severity === "medium").length,
    low: allFindings.filter((f) => f.severity === "low").length,
    info: allFindings.filter((f) => f.severity === "info").length,
  };

  return { findings: allFindings, counts };
}
