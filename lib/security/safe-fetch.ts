import dns from "node:dns/promises";
import ipaddr from "ipaddr.js";
import { validateAndNormalizeUrl } from "./url-validation";

export interface SafeFetchOptions {
  timeoutMs?: number;
  maxBytes?: number;
  expectedContentType?: "html" | "text" | "any";
  userAgent?: string;
  allowedOrigin?: string;
  maxRedirects?: number;
}

export interface SafeFetchResponse {
  url: string;
  status: number;
  contentType: string;
  body: string;
  headers: Record<string, string>;
  redirectChain: string[];
}

const DEFAULT_USER_AGENT = "CrawlBriefBot/1.0 (+https://crawlbrief.niketchauhan.com/tools/crawlbrief-ai)";
const DEFAULT_TIMEOUT_MS = 10000; // 10 seconds per request
const DEFAULT_MAX_BYTES = 2 * 1024 * 1024; // 2MB limit

/**
 * Checks if an IP address string is a globally routable public address.
 * Rejects private, loopback, link-local, multicast, cloud metadata, and reserved ranges.
 */
export function isPublicIp(ipString: string): boolean {
  try {
    const addr = ipaddr.parse(ipString);
    const range = addr.range();

    // Standard public unicast range check
    if (range !== "unicast") {
      return false;
    }

    // Explicit block for AWS/GCP/Azure link-local metadata address: 169.254.169.254
    if (ipString === "169.254.169.254") {
      return false;
    }

    // Additional IPv4 checks
    if (addr.kind() === "ipv4") {
      const octets = (addr as ipaddr.IPv4).octets;
      // 0.0.0.0/8
      if (octets[0] === 0) return false;
      // 10.0.0.0/8 (private)
      if (octets[0] === 10) return false;
      // 100.64.0.0/10 (carrier-grade NAT)
      if (octets[0] === 100 && octets[1] >= 64 && octets[1] <= 127) return false;
      // 127.0.0.0/8 (loopback)
      if (octets[0] === 127) return false;
      // 169.254.0.0/16 (link-local)
      if (octets[0] === 169 && octets[1] === 254) return false;
      // 172.16.0.0/12 (private)
      if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return false;
      // 192.168.0.0/16 (private)
      if (octets[0] === 192 && octets[1] === 168) return false;
      // 198.18.0.0/15 (benchmark)
      if (octets[0] === 198 && (octets[1] === 18 || octets[1] === 19)) return false;
      // 224.0.0.0/4 (multicast) & 240.0.0.0/4 (reserved)
      if (octets[0] >= 224) return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Validates that all resolved DNS addresses for a hostname are public.
 */
export async function validateHostDns(hostname: string): Promise<{ valid: boolean; error?: string; ip?: string }> {
  // If the hostname itself is an IP, check it directly
  if (ipaddr.isValid(hostname)) {
    if (!isPublicIp(hostname)) {
      return { valid: false, error: `Host IP ${hostname} is private or reserved` };
    }
    return { valid: true, ip: hostname };
  }

  // Reject internal metadata hostnames explicitly
  if (
    hostname === "metadata.google.internal" ||
    hostname.endsWith(".metadata.google.internal") ||
    hostname === "instance-data"
  ) {
    return { valid: false, error: "Cloud metadata endpoints are forbidden" };
  }

  try {
    // Resolve IPv4 addresses
    let ipv4Addresses: string[] = [];
    try {
      ipv4Addresses = await dns.resolve4(hostname);
    } catch {
      // It's acceptable if there are no A records, will check AAAA
    }

    // Resolve IPv6 addresses
    let ipv6Addresses: string[] = [];
    try {
      ipv6Addresses = await dns.resolve6(hostname);
    } catch {
      // It's acceptable if there are no AAAA records
    }

    const allIps = [...ipv4Addresses, ...ipv6Addresses];

    if (allIps.length === 0) {
      return { valid: false, error: `Could not resolve IP address for ${hostname}` };
    }

    // Verify EVERY resolved IP is public. If any address is private, reject (prevents DNS rebinding / dual homed attacks)
    for (const ip of allIps) {
      if (!isPublicIp(ip)) {
        return { valid: false, error: `Host ${hostname} resolves to non-public IP: ${ip}` };
      }
    }

    return { valid: true, ip: allIps[0] };
  } catch (err: any) {
    return { valid: false, error: `DNS lookup failed for ${hostname}: ${err.message}` };
  }
}

/**
 * SSRF-Safe Fetch: Enforces DNS validation, redirect control, size limits, and timeout.
 */
export async function safeFetch(
  targetUrl: string,
  options: SafeFetchOptions = {}
): Promise<SafeFetchResponse> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
  const userAgent = options.userAgent ?? DEFAULT_USER_AGENT;
  const maxRedirects = options.maxRedirects ?? 3;
  const allowedOrigin = options.allowedOrigin;

  let currentUrl = targetUrl;
  const redirectChain: string[] = [];

  for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount++) {
    // 1. URL Validation & Normalization
    const urlCheck = validateAndNormalizeUrl(currentUrl);
    if (!urlCheck.valid || !urlCheck.normalizedUrl || !urlCheck.host) {
      throw new Error(`Invalid URL: ${urlCheck.error || "Malformed URL"}`);
    }

    // Origin check: Do not cross origins if an origin was locked
    if (allowedOrigin && urlCheck.origin !== allowedOrigin) {
      throw new Error(`Cross-origin redirect to ${urlCheck.origin} rejected. MVP restricts to same origin.`);
    }

    // 2. DNS & SSRF Validation
    const dnsCheck = await validateHostDns(urlCheck.host);
    if (!dnsCheck.valid) {
      throw new Error(`Security validation failed: ${dnsCheck.error}`);
    }

    // 3. Outbound fetch with AbortController deadline
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(urlCheck.normalizedUrl, {
        method: "GET",
        headers: {
          "User-Agent": userAgent,
          Accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
        redirect: "manual", // Handle redirects manually to re-validate each hop
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle Redirects (301, 302, 303, 307, 308)
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location) {
          throw new Error(`Received redirect status ${response.status} without Location header`);
        }

        if (redirectCount >= maxRedirects) {
          throw new Error(`Exceeded maximum allowed redirects (${maxRedirects})`);
        }

        // Resolve relative redirect against current URL
        const nextUrl = new URL(location, urlCheck.normalizedUrl).toString();
        redirectChain.push(nextUrl);
        currentUrl = nextUrl;
        continue;
      }

      // Check Content-Type if requested
      const contentType = response.headers.get("content-type") || "";
      if (options.expectedContentType === "html") {
        if (!contentType.toLowerCase().includes("text/html") && !contentType.toLowerCase().includes("application/xhtml+xml")) {
          throw new Error(`Expected HTML content but received ${contentType || "unknown content-type"}`);
        }
      }

      // Read response stream with max size enforcement
      const reader = response.body?.getReader();
      if (!reader) {
        return {
          url: urlCheck.normalizedUrl,
          status: response.status,
          contentType,
          body: "",
          headers: Object.fromEntries(response.headers.entries()),
          redirectChain,
        };
      }

      const chunks: Uint8Array[] = [];
      let totalBytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          totalBytes += value.length;
          if (totalBytes > maxBytes) {
            reader.cancel();
            throw new Error(`Response body exceeded maximum allowed size of ${Math.round(maxBytes / (1024 * 1024))} MB`);
          }
          chunks.push(value);
        }
      }

      // Concatenate chunks
      const combined = new Uint8Array(totalBytes);
      let offset = 0;
      for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }

      const textBody = new TextDecoder("utf-8", { fatal: false }).decode(combined);

      return {
        url: urlCheck.normalizedUrl,
        status: response.status,
        contentType,
        body: textBody,
        headers: Object.fromEntries(response.headers.entries()),
        redirectChain,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        throw new Error(`Request timed out after ${timeoutMs}ms`);
      }
      throw err;
    }
  }

  throw new Error("Redirect chain unresolved");
}
