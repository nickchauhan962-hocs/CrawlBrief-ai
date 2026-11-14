import { getEnv } from "@/lib/env";

export interface PageSpeedResult {
  status: "completed" | "failed" | "skipped";
  error?: string;
  categories?: Record<string, { score: number | null; title?: string }>;
  metrics?: Record<string, { displayValue?: string; score?: number | null; numericValue?: number }>;
  performanceScore?: number | null;
}

/**
 * Runs a mobile PageSpeed Insights / Lighthouse audit for the landing page.
 */
export async function runPageSpeedAudit(url: string): Promise<PageSpeedResult> {
  const env = getEnv();
  const apiKey = env.PAGESPEED_API_KEY;

  if (!apiKey) {
    return {
      status: "skipped",
      error: "PageSpeed API key is not configured.",
    };
  }

  try {
    const endpoint = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
    endpoint.searchParams.set("url", url);
    endpoint.searchParams.set("strategy", "mobile");
    endpoint.searchParams.append("category", "performance");
    endpoint.searchParams.append("category", "accessibility");
    endpoint.searchParams.append("category", "best-practices");
    endpoint.searchParams.append("category", "seo");
    endpoint.searchParams.set("key", apiKey);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout

    const response = await fetch(endpoint.toString(), {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      return {
        status: "failed",
        error: `PageSpeed Insights returned HTTP ${response.status}: ${errText.slice(0, 150)}`,
      };
    }

    const data = await response.json();
    const lighthouse = data.lighthouseResult;

    if (!lighthouse) {
      return {
        status: "failed",
        error: "No Lighthouse audit data in PageSpeed response",
      };
    }

    // Extract categories
    const categories: Record<string, { score: number | null; title?: string }> = {};
    if (lighthouse.categories) {
      for (const [key, cat] of Object.entries<any>(lighthouse.categories)) {
        categories[key] = {
          score: typeof cat.score === "number" ? Math.round(cat.score * 100) : null,
          title: cat.title,
        };
      }
    }

    // Extract selected lab metrics
    const metrics: Record<string, any> = {};
    const auditRefs = [
      "first-contentful-paint",
      "largest-contentful-paint",
      "total-blocking-time",
      "cumulative-layout-shift",
      "speed-index",
    ];

    if (lighthouse.audits) {
      for (const ref of auditRefs) {
        const audit = lighthouse.audits[ref];
        if (audit) {
          metrics[ref] = {
            title: audit.title,
            displayValue: audit.displayValue,
            score: audit.score,
            numericValue: audit.numericValue,
          };
        }
      }
    }

    return {
      status: "completed",
      categories,
      metrics,
      performanceScore: categories["performance"]?.score ?? null,
    };
  } catch (err: any) {
    return {
      status: "failed",
      error: `PageSpeed audit failed: ${err.message}`,
    };
  }
}
