import { describe, it, expect } from "vitest";
import { validateAndNormalizeUrl } from "@/lib/security/url-validation";

describe("URL Validation and SSRF Safeguards", () => {
  it("accepts valid public https URL", () => {
    const result = validateAndNormalizeUrl("https://example.com");
    expect(result.valid).toBe(true);
    expect(result.normalizedUrl).toBe("https://example.com/");
    expect(result.host).toBe("example.com");
  });

  it("prepends https:// when protocol is omitted", () => {
    const result = validateAndNormalizeUrl("example.com/blog");
    expect(result.valid).toBe(true);
    expect(result.normalizedUrl).toBe("https://example.com/blog");
  });

  it("strips fragments (#) from normalized URL", () => {
    const result = validateAndNormalizeUrl("https://example.com/page#section-2");
    expect(result.valid).toBe(true);
    expect(result.normalizedUrl).toBe("https://example.com/page");
  });

  it("strips sensitive query parameters", () => {
    const result = validateAndNormalizeUrl("https://example.com/search?q=test&token=secret123&session=abc");
    expect(result.valid).toBe(true);
    expect(result.normalizedUrl).toBe("https://example.com/search?q=test");
  });

  it("rejects non-http/https protocols", () => {
    expect(validateAndNormalizeUrl("ftp://example.com").valid).toBe(false);
    expect(validateAndNormalizeUrl("file:///etc/passwd").valid).toBe(false);
    expect(validateAndNormalizeUrl("gopher://example.com").valid).toBe(false);
    expect(validateAndNormalizeUrl("javascript:alert(1)").valid).toBe(false);
  });

  it("rejects URLs containing credentials", () => {
    const result = validateAndNormalizeUrl("https://admin:password@example.com");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("credentials");
  });

  it("rejects non-standard ports", () => {
    const result = validateAndNormalizeUrl("https://example.com:8080");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("ports");
  });

  it("rejects localhost and loopback domains", () => {
    expect(validateAndNormalizeUrl("http://localhost").valid).toBe(false);
    expect(validateAndNormalizeUrl("http://localhost:80").valid).toBe(false);
    expect(validateAndNormalizeUrl("http://sub.localhost").valid).toBe(false);
    expect(validateAndNormalizeUrl("http://myhost.local").valid).toBe(false);
    expect(validateAndNormalizeUrl("http://myhost.internal").valid).toBe(false);
  });

  it("rejects private IPv4 literals", () => {
    expect(validateAndNormalizeUrl("http://127.0.0.1").valid).toBe(false);
    expect(validateAndNormalizeUrl("http://10.0.0.1").valid).toBe(false);
    expect(validateAndNormalizeUrl("http://192.168.1.1").valid).toBe(false);
    expect(validateAndNormalizeUrl("http://172.16.0.1").valid).toBe(false);
    expect(validateAndNormalizeUrl("http://169.254.169.254").valid).toBe(false);
  });

  it("rejects IPv6 loopback literals", () => {
    expect(validateAndNormalizeUrl("http://[::1]").valid).toBe(false);
  });
});
