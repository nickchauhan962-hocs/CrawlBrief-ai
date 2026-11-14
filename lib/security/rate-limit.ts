import crypto from "node:crypto";
import { getEnv } from "@/lib/env";
import { getSupabaseClient } from "@/lib/supabase/server";

export interface RateLimitResult {
  allowed: boolean;
  reason?: "ip_limit_exceeded" | "global_limit_exceeded" | "invalid_fingerprint";
  ipRemaining?: number;
  globalRemaining?: number;
}

// In-memory fallback for local development or when Supabase is disconnected
const inMemoryIpCounts = new Map<string, { date: string; count: number }>();
const inMemoryGlobalCounts = new Map<string, number>();

/**
 * Generates an HMAC-SHA256 hash of the client's IP address.
 * Never stores or logs the raw IP address.
 */
export function hashClientIp(ip: string): string {
  const env = getEnv();
  const secret = env.IP_HASH_SECRET;
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(ip || "127.0.0.1");
  return hmac.digest("hex");
}

/**
 * Checks and atomically consumes rate limit quota.
 * Calls Supabase RPC public.consume_audit_quota when configured,
 * or falls back to atomic in-memory limits in local development.
 */
export async function consumeRateLimitQuota(clientIp: string): Promise<RateLimitResult> {
  const env = getEnv();
  const fingerprintHash = hashClientIp(clientIp);
  const dailyIpLimit = env.DAILY_IP_AUDIT_LIMIT;
  const dailyGlobalLimit = env.DAILY_GLOBAL_AUDIT_LIMIT;

  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await supabase.rpc("consume_audit_quota", {
        p_fingerprint_hash: fingerprintHash,
        p_daily_ip_limit: dailyIpLimit,
        p_daily_global_limit: dailyGlobalLimit,
      });

      if (error) {
        console.error("Supabase consume_audit_quota error:", error);
        // Fall back to in-memory check if DB throws unexpected error
      } else {
        const allowed = Boolean(data);
        return {
          allowed,
          reason: allowed ? undefined : "ip_limit_exceeded",
        };
      }
    } catch (dbErr) {
      console.error("Database connection error during rate limiting:", dbErr);
    }
  }

  // In-memory fallback (e.g. during local testing or without Supabase credentials)
  const today = new Date().toISOString().slice(0, 10);
  
  // IP limit check
  const ipRecord = inMemoryIpCounts.get(fingerprintHash);
  let currentIpCount = 0;
  if (ipRecord && ipRecord.date === today) {
    currentIpCount = ipRecord.count;
  }
  if (currentIpCount >= dailyIpLimit) {
    return { allowed: false, reason: "ip_limit_exceeded" };
  }

  // Global limit check
  const currentGlobalCount = inMemoryGlobalCounts.get(today) || 0;
  if (currentGlobalCount >= dailyGlobalLimit) {
    return { allowed: false, reason: "global_limit_exceeded" };
  }

  // Atomically increment in-memory
  inMemoryIpCounts.set(fingerprintHash, { date: today, count: currentIpCount + 1 });
  inMemoryGlobalCounts.set(today, currentGlobalCount + 1);

  return {
    allowed: true,
    ipRemaining: Math.max(0, dailyIpLimit - (currentIpCount + 1)),
    globalRemaining: Math.max(0, dailyGlobalLimit - (currentGlobalCount + 1)),
  };
}
