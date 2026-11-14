import robotsParser from "robots-parser";
import { safeFetch } from "@/lib/security/safe-fetch";

export interface RobotsCheckResult {
  allowed: boolean;
  robotsUrl: string;
  statusCode?: number;
  sitemaps: string[];
  statusMessage: string;
}

export const CRAWLBRIEF_USER_AGENT = "CrawlBriefBot/1.0 (+https://crawlbrief.niketchauhan.com/tools/crawlbrief-ai)";
export const CRAWLBRIEF_ROBOTS_UA_KEY = "CrawlBriefBot";

/**
 * Fetches and parses robots.txt for a given origin.
 */
export async function getRobotsPolicy(origin: string): Promise<{
  isAllowed: (url: string) => boolean;
  sitemaps: string[];
  statusMessage: string;
  statusCode?: number;
}> {
  const robotsUrl = `${origin}/robots.txt`;

  try {
    const response = await safeFetch(robotsUrl, {
      timeoutMs: 5000,
      maxBytes: 512 * 1024, // 512KB max for robots.txt
      expectedContentType: "any",
      allowedOrigin: origin,
    });

    if (response.status === 404 || response.status === 410) {
      return {
        isAllowed: () => true,
        sitemaps: [],
        statusMessage: "robots.txt not found (404/410) - crawling permitted",
        statusCode: response.status,
      };
    }

    if (response.status >= 500) {
      return {
        isAllowed: () => false,
        sitemaps: [],
        statusMessage: `Target server returned ${response.status} when accessing robots.txt`,
        statusCode: response.status,
      };
    }

    if (response.status >= 400 && response.status < 500) {
      return {
        isAllowed: () => false,
        sitemaps: [],
        statusMessage: `Access to robots.txt was rejected with HTTP ${response.status}`,
        statusCode: response.status,
      };
    }

    const robots = robotsParser(robotsUrl, response.body);
    const sitemaps = robots.getSitemaps() || [];

    return {
      isAllowed: (url: string) => {
        // Try exact bot UA first, then wildcard
        const allowed = robots.isAllowed(url, CRAWLBRIEF_ROBOTS_UA_KEY);
        if (allowed === undefined) {
          return robots.isAllowed(url, "*") ?? true;
        }
        return allowed;
      },
      sitemaps,
      statusMessage: "robots.txt parsed successfully",
      statusCode: response.status,
    };
  } catch (err: any) {
    // If robots.txt fetch fails due to timeout or network issue
    return {
      isAllowed: () => true, // default to allowing if robots.txt is unreachable but page is public
      sitemaps: [],
      statusMessage: `Could not fetch robots.txt (${err.message}). Defaulting to standard crawler access.`,
    };
  }
}
