import { describe, it, expect } from "vitest";
import { isPublicIp, validateHostDns } from "@/lib/security/safe-fetch";

describe("Safe Fetch & IP Classification", () => {
  it("recognizes public routable IPv4 addresses", () => {
    expect(isPublicIp("8.8.8.8")).toBe(true);
    expect(isPublicIp("1.1.1.1")).toBe(true);
    expect(isPublicIp("93.184.216.34")).toBe(true); // example.com
    expect(isPublicIp("142.250.190.46")).toBe(true); // google.com
  });

  it("blocks private, loopback, and carrier-grade NAT IPv4 ranges", () => {
    expect(isPublicIp("127.0.0.1")).toBe(false);
    expect(isPublicIp("127.0.0.2")).toBe(false);
    expect(isPublicIp("10.0.0.1")).toBe(false);
    expect(isPublicIp("10.255.255.255")).toBe(false);
    expect(isPublicIp("192.168.0.1")).toBe(false);
    expect(isPublicIp("172.16.0.1")).toBe(false);
    expect(isPublicIp("172.31.255.255")).toBe(false);
    expect(isPublicIp("100.64.0.1")).toBe(false); // CGNAT
    expect(isPublicIp("0.0.0.0")).toBe(false);
  });

  it("blocks AWS/GCP cloud metadata address (169.254.169.254)", () => {
    expect(isPublicIp("169.254.169.254")).toBe(false);
    expect(isPublicIp("169.254.1.1")).toBe(false);
  });

  it("blocks IPv6 loopback, link-local, and unique-local ranges", () => {
    expect(isPublicIp("::1")).toBe(false);
    expect(isPublicIp("fe80::1")).toBe(false);
    expect(isPublicIp("fc00::1")).toBe(false);
    expect(isPublicIp("fd00::1")).toBe(false);
  });

  it("blocks cloud metadata hostnames", async () => {
    const metaGoogle = await validateHostDns("metadata.google.internal");
    expect(metaGoogle.valid).toBe(false);
    expect(metaGoogle.error).toContain("metadata");

    const instanceData = await validateHostDns("instance-data");
    expect(instanceData.valid).toBe(false);
  });
});
