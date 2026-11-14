import { safeFetch } from "@/lib/security/safe-fetch";
import { extractPageFacts } from "./extract";
import { getRobotsPolicy } from "./robots";
import { PageFact } from "@/lib/schemas/audit-report";

export interface CrawlResult {
  pages: PageFact[];
  crawlMetadata: {
    pages_attempted: number;
    pages_fetched: number;
    robots_status: string;
    crawl_limitations: string[];
  };
}

const MAX_PAGES = 5;
const CONCURRENCY = 2;

/**
 * Crawls up to 5 same-origin HTML pages starting from the landing page.
 * Respects robots.txt, concurrency limits, and size restrictions.
 */
export async function crawlSite(startUrl: string, origin: string): Promise<CrawlResult> {
  const limitations: string[] = [];
  const crawledPages: PageFact[] = [];
  const visitedUrls = new Set<string>();
  const queue: string[] = [startUrl];

  // 1. Fetch & evaluate robots.txt
  const robotsPolicy = await getRobotsPolicy(origin);
  let robotsStatus = robotsPolicy.statusMessage;

  // Check if landing page is disallowed
  if (!robotsPolicy.isAllowed(startUrl)) {
    throw new Error(`This website's robots.txt rules do not allow the landing page to be crawled by CrawlBrief AI.`);
  }

  let pagesAttempted = 0;

  // Breadth-First Crawl loop with concurrency control
  while (queue.length > 0 && crawledPages.length < MAX_PAGES) {
    // Pick next batch up to concurrency limit
    const batchUrls: string[] = [];
    while (queue.length > 0 && batchUrls.length < CONCURRENCY && (crawledPages.length + batchUrls.length) < MAX_PAGES) {
      const candidate = queue.shift()!;
      if (!visitedUrls.has(candidate)) {
        visitedUrls.add(candidate);
        // Check robots.txt
        if (robotsPolicy.isAllowed(candidate)) {
          batchUrls.push(candidate);
        } else {
          limitations.push(`Skipped ${candidate} due to robots.txt disallow rule`);
        }
      }
    }

    if (batchUrls.length === 0) break;

    // Fetch batch concurrently
    const fetchPromises = batchUrls.map(async (pageUrl) => {
      pagesAttempted++;
      try {
        const response = await safeFetch(pageUrl, {
          timeoutMs: 12000,
          maxBytes: 2 * 1024 * 1024,
          expectedContentType: "html",
          allowedOrigin: origin,
          maxRedirects: 3,
        });

        const extracted = extractPageFacts(
          response.url,
          response.body,
          response.status,
          response.contentType,
          response.headers
        );

        return { success: true, facts: extracted.facts, newUrls: extracted.discoveredInternalUrls };
      } catch (err: any) {
        limitations.push(`Failed to crawl ${pageUrl}: ${err.message}`);
        return { success: false, error: err.message };
      }
    });

    const results = await Promise.all(fetchPromises);

    for (const res of results) {
      if (res.success && res.facts) {
        crawledPages.push(res.facts);
        // Add discovered internal URLs to queue
        for (const nextUrl of res.newUrls || []) {
          if (!visitedUrls.has(nextUrl) && !queue.includes(nextUrl)) {
            queue.push(nextUrl);
          }
        }
      }
    }
  }

  if (crawledPages.length === 0) {
    throw new Error("Unable to fetch any HTML pages from the target website");
  }

  if (queue.length > 0) {
    limitations.push(`Crawl capped at ${MAX_PAGES} pages for MVP. Additional discovered internal pages were not crawled.`);
  }

  return {
    pages: crawledPages,
    crawlMetadata: {
      pages_attempted: pagesAttempted,
      pages_fetched: crawledPages.length,
      robots_status: robotsStatus,
      crawl_limitations: limitations,
    },
  };
}
