import * as cheerio from "cheerio";
import { PageFact } from "@/lib/schemas/audit-report";

export interface ExtractedPageResult {
  facts: PageFact;
  discoveredInternalUrls: string[];
}

/**
 * Extracts facts and signals from a fetched HTML page using Cheerio.
 * Does NOT execute any JavaScript.
 */
export function extractPageFacts(
  url: string,
  html: string,
  httpStatus: number = 200,
  contentType: string = "text/html",
  responseHeaders: Record<string, string> = {}
): ExtractedPageResult {
  const $ = cheerio.load(html, { xml: false });

  // 1. Title & Meta Description
  const title = $("title").first().text().trim() || null;
  const metaDescription =
    $('meta[name="description" i]').attr("content")?.trim() ||
    $('meta[property="og:description" i]').attr("content")?.trim() ||
    null;

  // 2. Canonical URL
  const canonicalHref = $('link[rel="canonical" i]').attr("href")?.trim() || null;
  let canonical_url: string | null = null;
  if (canonicalHref) {
    try {
      canonical_url = new URL(canonicalHref, url).toString();
    } catch {
      canonical_url = canonicalHref;
    }
  }

  // 3. Robots Directives (Meta tags + X-Robots-Tag response header)
  const robots_directives: string[] = [];
  $('meta[name="robots" i], meta[name="googlebot" i]').each((_, el) => {
    const content = $(el).attr("content");
    if (content) {
      content.split(",").forEach((directive) => {
        const clean = directive.trim().toLowerCase();
        if (clean && !robots_directives.includes(clean)) {
          robots_directives.push(clean);
        }
      });
    }
  });

  const xRobotsTag = responseHeaders["x-robots-tag"];
  if (xRobotsTag) {
    xRobotsTag.split(",").forEach((directive) => {
      const clean = directive.trim().toLowerCase();
      if (clean && !robots_directives.includes(clean)) {
        robots_directives.push(clean);
      }
    });
  }

  // 4. HTML Language & Viewport
  const html_lang = $("html").attr("lang")?.trim() || null;
  const viewportTag = $('meta[name="viewport" i]').attr("content");
  const has_viewport = Boolean(viewportTag && viewportTag.toLowerCase().includes("width="));

  // 5. Headings: H1s & Outline
  const h1_texts: string[] = [];
  $("h1").each((_, el) => {
    const text = $(el).text().trim();
    if (text) h1_texts.push(text);
  });

  const heading_outline: { level: number; text: string }[] = [];
  $("h1, h2, h3, h4, h5, h6").each((_, el) => {
    const tagName = el.tagName?.toLowerCase();
    const level = parseInt(tagName.replace("h", ""), 10);
    const text = $(el).text().trim();
    if (text && !isNaN(level) && heading_outline.length < 50) {
      heading_outline.push({ level, text: text.slice(0, 150) });
    }
  });

  // 6. Images & Alt attributes
  let image_count = 0;
  let images_without_alt = 0;
  $("img").each((_, el) => {
    image_count++;
    const alt = $(el).attr("alt");
    // Missing alt attribute is an accessibility & SEO defect
    if (typeof alt !== "string") {
      images_without_alt++;
    }
  });

  // 7. Links: Internal & External + Discovery
  let internal_link_count = 0;
  let external_link_count = 0;
  const discoveredInternalUrls: string[] = [];
  const baseOrigin = new URL(url).origin;

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href")?.trim();
    if (!href || href.startsWith("#") || href.startsWith("javascript:") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      return;
    }

    try {
      const resolved = new URL(href, url);
      // Remove hash and trailing slash for consistency
      resolved.hash = "";
      const resolvedUrl = resolved.toString();

      if (resolved.origin === baseOrigin) {
        internal_link_count++;
        // Check if candidate for crawling (html path)
        const pathname = resolved.pathname.toLowerCase();
        const isStaticAsset = /\.(png|jpg|jpeg|gif|svg|webp|css|js|pdf|zip|mp4|webm|woff2?|ico|xml|json)$/i.test(pathname);
        if (!isStaticAsset && !discoveredInternalUrls.includes(resolvedUrl) && resolvedUrl !== url) {
          discoveredInternalUrls.push(resolvedUrl);
        }
      } else {
        external_link_count++;
      }
    } catch {
      // Invalid URL in href
    }
  });

  // 8. JSON-LD Structured Data
  const jsonld_types: string[] = [];
  const jsonld_parse_errors: string[] = [];

  $('script[type="application/ld+json"]').each((_, el) => {
    const rawContent = $(el).html()?.trim();
    if (!rawContent) return;

    try {
      const parsed = JSON.parse(rawContent);

      const extractTypes = (obj: any) => {
        if (!obj || typeof obj !== "object") return;
        if (Array.isArray(obj)) {
          obj.forEach(extractTypes);
          return;
        }

        if (obj["@type"]) {
          const t = obj["@type"];
          if (Array.isArray(t)) {
            t.forEach((item) => {
              if (typeof item === "string" && !jsonld_types.includes(item)) {
                jsonld_types.push(item);
              }
            });
          } else if (typeof t === "string" && !jsonld_types.includes(t)) {
            jsonld_types.push(t);
          }
        }

        // Recursively inspect graph or nested items
        if (obj["@graph"] && Array.isArray(obj["@graph"])) {
          obj["@graph"].forEach(extractTypes);
        }
      };

      extractTypes(parsed);
    } catch (parseErr: any) {
      jsonld_parse_errors.push(`JSON-LD parse error: ${parseErr.message}`);
    }
  });

  // 9. Visible-Text Word Count & Bounded Sample (max 1500 chars for Gemini)
  // Remove non-content elements
  const clone$ = cheerio.load(html, { xml: false });
  clone$("script, style, noscript, svg, path, iframe, nav, footer, header, form").remove();
  const rawText = clone$("body").text().replace(/\s+/g, " ").trim();
  const words = rawText ? rawText.split(/\s+/).filter(Boolean) : [];
  const word_count = words.length;
  const text_sample = rawText.slice(0, 1500);

  const facts: PageFact = {
    url,
    http_status: httpStatus,
    content_type: contentType,
    title,
    meta_description: metaDescription,
    h1_texts,
    heading_outline,
    canonical_url,
    robots_directives,
    html_lang,
    has_viewport,
    word_count,
    image_count,
    images_without_alt,
    internal_link_count,
    external_link_count,
    jsonld_types,
    jsonld_parse_errors,
    text_sample,
  };

  return { facts, discoveredInternalUrls };
}
