import { describe, it, expect } from "vitest";
import robotsParser from "robots-parser";

describe("robots.txt Parsing & Directives", () => {
  const robotsTxtContent = `
User-agent: *
Disallow: /admin/
Disallow: /private/
Allow: /public/

User-agent: CrawlBriefBot
Disallow: /no-crawlbrief/
Disallow: /admin/

Sitemap: https://example.com/sitemap.xml
`;

  it("respects wildcard disallow rules", () => {
    const robots = robotsParser("https://example.com/robots.txt", robotsTxtContent);
    expect(robots.isAllowed("https://example.com/admin/dashboard", "Googlebot")).toBe(false);
    expect(robots.isAllowed("https://example.com/private/data", "Googlebot")).toBe(false);
    expect(robots.isAllowed("https://example.com/public/page", "Googlebot")).toBe(true);
  });

  it("prioritizes CrawlBriefBot specific rules", () => {
    const robots = robotsParser("https://example.com/robots.txt", robotsTxtContent);
    expect(robots.isAllowed("https://example.com/no-crawlbrief/test", "CrawlBriefBot")).toBe(false);
    expect(robots.isAllowed("https://example.com/admin/login", "CrawlBriefBot")).toBe(false);
    expect(robots.isAllowed("https://example.com/articles/seo", "CrawlBriefBot")).toBe(true);
  });

  it("extracts sitemap URLs", () => {
    const robots = robotsParser("https://example.com/robots.txt", robotsTxtContent);
    const sitemaps = robots.getSitemaps();
    expect(sitemaps).toContain("https://example.com/sitemap.xml");
  });
});
