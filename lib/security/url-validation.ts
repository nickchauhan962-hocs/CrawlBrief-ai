import ipaddr from "ipaddr.js";

export interface NormalizedUrlResult {
  valid: boolean;
  error?: string;
  normalizedUrl?: string;
  host?: string;
  origin?: string;
  protocol?: string;
  port?: number;
}

/**
 * Validates and normalizes user-submitted URLs with strict SSRF & format checks.
 */
export function validateAndNormalizeUrl(rawInput: string): NormalizedUrlResult {
  if (!rawInput || typeof rawInput !== "string") {
    return { valid: false, error: "Website URL is required" };
  }

  const trimmed = rawInput.trim();
  if (trimmed.length > 2048) {
    return { valid: false, error: "URL exceeds maximum length of 2048 characters" };
  }

  // Prepend https:// if protocol was omitted
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(withProtocol);
  } catch {
    return { valid: false, error: "Enter a valid public website URL beginning with http:// or https://" };
  }

  // Protocol check: only http and https allowed
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { valid: false, error: "Only http and https protocols are supported" };
  }

  // Credentials check
  if (parsed.username || parsed.password) {
    return { valid: false, error: "URLs containing user credentials are not permitted" };
  }

  // Port check: only 80 and 443 allowed (or default port)
  const port = parsed.port ? parseInt(parsed.port, 10) : parsed.protocol === "https:" ? 443 : 80;
  if (port !== 80 && port !== 443) {
    return { valid: false, error: "Only standard web ports (80 and 443) are supported" };
  }

  const host = parsed.hostname.toLowerCase();

  // Reject empty host or localhost
  if (!host || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) {
    return { valid: false, error: "Local and internal hosts are not permitted" };
  }

  // Check if host is an IP literal (strip IPv6 brackets if present)
  const cleanIpHost = host.startsWith("[") && host.endsWith("]") ? host.slice(1, -1) : host;
  if (ipaddr.isValid(cleanIpHost)) {
    try {
      const parsedIp = ipaddr.parse(cleanIpHost);
      const range = parsedIp.range();
      if (range !== "unicast") {
        return { valid: false, error: "Private, loopback, and reserved IP addresses are not permitted" };
      }
    } catch {
      return { valid: false, error: "Invalid IP address format" };
    }
  }

  // Basic domain format validation (must contain at least one dot unless IPv6 bracketed)
  if (!host.includes(".") && !host.startsWith("[")) {
    return { valid: false, error: "Please enter a fully-qualified domain name (e.g. example.com)" };
  }

  // Remove fragment (#)
  parsed.hash = "";

  // Strip session-like or sensitive tracking query params if any
  const sensitiveParams = ["token", "auth", "session", "key", "secret", "password", "access_token"];
  sensitiveParams.forEach((param) => parsed.searchParams.delete(param));

  const normalizedUrl = parsed.toString();
  const origin = `${parsed.protocol}//${host}${parsed.port && port !== 80 && port !== 443 ? `:${port}` : ""}`;

  return {
    valid: true,
    normalizedUrl,
    host,
    origin,
    protocol: parsed.protocol,
    port,
  };
}
