import { Finding, PageFact } from "@/lib/schemas/audit-report";

export interface CheckExecutionInput {
  page: PageFact;
  pageIndex: number;
  isLandingPage: boolean;
  sitemaps?: string[];
}

/**
 * Runs deterministic technical, content, and schema checks against a single page.
 */
export function runPageChecks(input: CheckExecutionInput): Finding[] {
  const { page, isLandingPage, sitemaps = [] } = input;
  const findings: Finding[] = [];

  // 1. HTTP Status check
  if (!page.http_status || page.http_status < 200 || page.http_status >= 300) {
    findings.push({
      page_url: page.url,
      check_key: "http_status",
      category: "technical",
      severity: "high",
      title: "Non-2xx HTTP Status Code",
      description: `The page returned HTTP response code ${page.http_status ?? "unknown"}. Search engines may not crawl or index this page.`,
      evidence: { http_status: page.http_status },
      recommendation: "Ensure the server responds with a 200 OK status code for public content.",
    });
  }

  // 2. Title Present & Length Check
  if (!page.title || page.title.trim().length === 0) {
    findings.push({
      page_url: page.url,
      check_key: "title_present",
      category: "technical",
      severity: "high",
      title: "Missing Document Title",
      description: "The page lacks a <title> element, which is essential for search engines and browser tabs.",
      evidence: { title: null },
      recommendation: "Add a descriptive, concise <title> tag between 30 and 65 characters.",
    });
  } else {
    const titleLen = page.title.trim().length;
    if (titleLen < 20) {
      findings.push({
        page_url: page.url,
        check_key: "title_length",
        category: "content",
        severity: "low",
        title: "Short Document Title",
        description: `The title is ${titleLen} characters, which may be too concise to communicate the page context.`,
        evidence: { title: page.title, length: titleLen },
        recommendation: "Consider expanding the title to 30-65 characters with relevant context or brand name.",
      });
    } else if (titleLen > 70) {
      findings.push({
        page_url: page.url,
        check_key: "title_length",
        category: "content",
        severity: "low",
        title: "Long Document Title",
        description: `The title is ${titleLen} characters and may be truncated in search engine snippets.`,
        evidence: { title: page.title, length: titleLen },
        recommendation: "Keep the most important keywords within the first 60 characters.",
      });
    }
  }

  // 3. Meta Description Check
  if (!page.meta_description || page.meta_description.trim().length === 0) {
    findings.push({
      page_url: page.url,
      check_key: "meta_description_present",
      category: "technical",
      severity: "medium",
      title: "Missing Meta Description",
      description: "No meta description tag was detected. Search engines may auto-generate snippets from random text.",
      evidence: { meta_description: null },
      recommendation: "Add a clear meta description summarizing the page purpose (around 120-160 characters).",
    });
  } else {
    const descLen = page.meta_description.trim().length;
    if (descLen < 50 || descLen > 200) {
      findings.push({
        page_url: page.url,
        check_key: "meta_description_length",
        category: "content",
        severity: "low",
        title: descLen < 50 ? "Short Meta Description" : "Long Meta Description",
        description: `The meta description is ${descLen} characters long. Recommended length is typically between 70 and 160 characters.`,
        evidence: { meta_description: page.meta_description, length: descLen },
        recommendation: "Aim for a focused description between 70 and 160 characters that acts as a compelling summary.",
      });
    }
  }

  // 4. H1 Heading Check
  if (page.h1_texts.length === 0) {
    findings.push({
      page_url: page.url,
      check_key: "h1_present",
      category: "content",
      severity: "medium",
      title: "Missing H1 Heading",
      description: "No <h1> heading found on the page. Headings establish clear semantic structure for users and bots.",
      evidence: { h1_count: 0 },
      recommendation: "Include one primary <h1> tag that describes the central topic of the page.",
    });
  } else if (page.h1_texts.length > 1) {
    findings.push({
      page_url: page.url,
      check_key: "h1_multiple",
      category: "content",
      severity: "low",
      title: "Multiple H1 Headings Detected",
      description: `The page contains ${page.h1_texts.length} <h1> tags. While valid in HTML5, having a single main topic heading is usually clearer.`,
      evidence: { h1_texts: page.h1_texts },
      recommendation: "Review whether secondary headings should be nested as <h2> instead of additional <h1> elements.",
    });
  }

  // 5. Canonical Link Check
  if (!page.canonical_url) {
    findings.push({
      page_url: page.url,
      check_key: "canonical_present",
      category: "technical",
      severity: "low",
      title: "Missing Canonical Tag",
      description: "No <link rel=\"canonical\"> tag was found. Canonical tags help prevent duplicate content ambiguity.",
      evidence: { canonical_url: null },
      recommendation: "Specify an explicit canonical link pointing to the preferred URL for this page.",
    });
  }

  // 6. Indexability Directive (noindex)
  const hasNoindex = page.robots_directives.some((d) => d.includes("noindex"));
  if (hasNoindex) {
    findings.push({
      page_url: page.url,
      check_key: "indexability_directive",
      category: "technical",
      severity: "high",
      title: "Indexation Blocked via 'noindex'",
      description: "A 'noindex' directive was discovered in page meta tags or response headers. This prevents search engines from indexing the page.",
      evidence: { robots_directives: page.robots_directives },
      recommendation: "Remove the 'noindex' directive if you intend for this page to appear in organic search results.",
    });
  }

  // 7. HTML Lang Check
  if (!page.html_lang) {
    findings.push({
      page_url: page.url,
      check_key: "html_lang_present",
      category: "technical",
      severity: "low",
      title: "Missing HTML Language Attribute",
      description: "The <html> root element does not declare a 'lang' attribute. This affects screen readers and language targeting.",
      evidence: { html_lang: null },
      recommendation: "Add a valid lang attribute to the <html> tag (e.g. <html lang=\"en\">).",
    });
  }

  // 8. Responsive Viewport Check
  if (!page.has_viewport) {
    findings.push({
      page_url: page.url,
      check_key: "viewport_present",
      category: "technical",
      severity: "medium",
      title: "Missing Responsive Viewport Tag",
      description: "No standard <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"> was detected.",
      evidence: { has_viewport: false },
      recommendation: "Add a mobile viewport meta tag to ensure proper scaling on mobile and tablet devices.",
    });
  }

  // 9. Image Alt Coverage Check
  if (page.image_count > 0 && page.images_without_alt > 0) {
    const missingRatio = Math.round((page.images_without_alt / page.image_count) * 100);
    findings.push({
      page_url: page.url,
      check_key: "image_alt_coverage",
      category: "technical",
      severity: missingRatio > 50 ? "medium" : "low",
      title: "Images Missing Alt Attributes",
      description: `${page.images_without_alt} out of ${page.image_count} images (${missingRatio}%) are missing alt attributes.`,
      evidence: {
        image_count: page.image_count,
        images_without_alt: page.images_without_alt,
        percentage_missing: missingRatio,
      },
      recommendation: "Add descriptive alt text to informative images, or alt=\"\" for decorative images.",
    });
  }

  // 10. Heading Structure Check
  if (page.heading_outline.length > 0) {
    let hasSkippedLevels = false;
    for (let i = 0; i < page.heading_outline.length - 1; i++) {
      const current = page.heading_outline[i].level;
      const next = page.heading_outline[i + 1].level;
      if (next - current > 1) {
        hasSkippedLevels = true;
        break;
      }
    }

    if (hasSkippedLevels) {
      findings.push({
        page_url: page.url,
        check_key: "heading_structure",
        category: "content",
        severity: "low",
        title: "Skipped Heading Levels",
        description: "The heading hierarchy jumps levels (for example, H1 directly to H3 without an intervening H2).",
        evidence: { outline_sample: page.heading_outline.slice(0, 6) },
        recommendation: "Structure headings in progressive numerical order (H1 -> H2 -> H3) for accessibility and clarity.",
      });
    }
  }

  // 11. Structured Data / JSON-LD Checks
  if (page.jsonld_parse_errors.length > 0) {
    findings.push({
      page_url: page.url,
      check_key: "jsonld_parse",
      category: "schema",
      severity: "medium",
      title: "JSON-LD Syntax Parse Errors",
      description: "One or more JSON-LD script tags contain invalid JSON syntax and could not be interpreted.",
      evidence: { errors: page.jsonld_parse_errors },
      recommendation: "Validate and format the JSON inside <script type=\"application/ld+json\"> tags.",
    });
  } else if (page.jsonld_types.length === 0 && isLandingPage) {
    findings.push({
      page_url: page.url,
      check_key: "jsonld_parse",
      category: "schema",
      severity: "info",
      title: "No JSON-LD Structured Data Detected",
      description: "No schema.org structured data was found on the landing page. Adding Organization or WebSite schema helps search engines understand entities.",
      evidence: { jsonld_types: [] },
      recommendation: "Consider adding JSON-LD structured data such as Organization, WebSite, or Article schema.",
    });
  }

  // 12. Visible Content Volume Check
  if (page.word_count < 100 && page.http_status === 200) {
    findings.push({
      page_url: page.url,
      check_key: "content_volume",
      category: "content",
      severity: "medium",
      title: "Very Low Visible Text Volume",
      description: `Only ~${page.word_count} visible words were detected. The page may rely entirely on client-side JavaScript rendering or have thin content.`,
      evidence: { word_count: page.word_count },
      recommendation: "Ensure primary text content is rendered server-side so static crawlers can read it.",
    });
  }

  // 13. Sitemap declaration (landing page only)
  if (isLandingPage) {
    if (sitemaps.length > 0) {
      findings.push({
        page_url: page.url,
        check_key: "robots_sitemap",
        category: "technical",
        severity: "info",
        title: "XML Sitemap Declared in robots.txt",
        description: `Discovered sitemap declaration in robots.txt: ${sitemaps[0]}`,
        evidence: { sitemaps },
        recommendation: "Maintain your XML sitemap and keep URLs up to date with 200 OK canonical destinations.",
      });
    } else {
      findings.push({
        page_url: page.url,
        check_key: "robots_sitemap",
        category: "technical",
        severity: "info",
        title: "No Sitemap Link in robots.txt",
        description: "No Sitemap directive was found in robots.txt. Declaring a sitemap helps search bots discover all site pages.",
        evidence: { sitemaps: [] },
        recommendation: "Add a 'Sitemap: https://yourdomain.com/sitemap.xml' line to robots.txt.",
      });
    }
  }

  return findings;
}
