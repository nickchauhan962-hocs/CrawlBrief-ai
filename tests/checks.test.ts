import { describe, it, expect } from "vitest";
import { extractPageFacts } from "@/lib/crawler/extract";
import { runPageChecks } from "@/lib/audit/checks";

describe("Deterministic Technical & Content Checks", () => {
  it("extracts page facts and detects missing title, description, and h1", () => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body>
          <p>Hello world without title or h1 tag.</p>
        </body>
      </html>
    `;

    const { facts } = extractPageFacts("https://example.com", html, 200, "text/html");
    const findings = runPageChecks({
      page: facts,
      pageIndex: 0,
      isLandingPage: true,
    });

    const checkKeys = findings.map((f) => f.check_key);
    expect(checkKeys).toContain("title_present");
    expect(checkKeys).toContain("meta_description_present");
    expect(checkKeys).toContain("h1_present");
    expect(checkKeys).toContain("canonical_present");
    expect(checkKeys).toContain("html_lang_present");

    const titleFinding = findings.find((f) => f.check_key === "title_present");
    expect(titleFinding?.severity).toBe("high");
  });

  it("extracts JSON-LD types and flags syntax parse errors", () => {
    const htmlWithJsonLd = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <title>Valid SEO Page Example</title>
          <meta name="description" content="This is a valid meta description with appropriate length for search engines.">
          <link rel="canonical" href="https://example.com/">
          <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Example Corp"
            }
          </script>
          <script type="application/ld+json">
            { invalid json syntax here ... }
          </script>
        </head>
        <body>
          <h1>Main Page Topic</h1>
          <p>Sufficient page text content to fulfill visible text volume analysis.</p>
        </body>
      </html>
    `;

    const { facts } = extractPageFacts("https://example.com", htmlWithJsonLd, 200);
    expect(facts.jsonld_types).toContain("Organization");
    expect(facts.jsonld_parse_errors.length).toBeGreaterThan(0);

    const findings = runPageChecks({
      page: facts,
      pageIndex: 0,
      isLandingPage: true,
    });

    const jsonldParseFinding = findings.find((f) => f.check_key === "jsonld_parse");
    expect(jsonldParseFinding?.severity).toBe("medium");
  });

  it("detects noindex directives", () => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Staging Page</title>
          <meta name="robots" content="noindex, nofollow">
        </head>
        <body>
          <h1>Staging</h1>
        </body>
      </html>
    `;

    const { facts } = extractPageFacts("https://example.com", html, 200);
    const findings = runPageChecks({
      page: facts,
      pageIndex: 0,
      isLandingPage: true,
    });

    const noindexFinding = findings.find((f) => f.check_key === "indexability_directive");
    expect(noindexFinding).toBeDefined();
    expect(noindexFinding?.severity).toBe("high");
  });

  it("calculates image alt coverage", () => {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head><title>Images Test</title></head>
        <body>
          <h1>Gallery</h1>
          <img src="/img1.png" alt="Informative logo">
          <img src="/img2.png">
          <img src="/img3.png">
        </body>
      </html>
    `;

    const { facts } = extractPageFacts("https://example.com", html, 200);
    expect(facts.image_count).toBe(3);
    expect(facts.images_without_alt).toBe(2);

    const findings = runPageChecks({
      page: facts,
      pageIndex: 0,
      isLandingPage: true,
    });

    const altFinding = findings.find((f) => f.check_key === "image_alt_coverage");
    expect(altFinding).toBeDefined();
    expect(altFinding?.evidence?.percentage_missing).toBe(67);
  });
});
