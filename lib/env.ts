import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  
  // Supabase
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // Google APIs
  GEMINI_API_KEY: z.string().min(1).optional(),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
  PAGESPEED_API_KEY: z.string().min(1).optional(),

  // Cloudflare Turnstile
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),

  // Server security
  IP_HASH_SECRET: z.string().default("development-secret-key-at-least-32-chars-long-12345"),
  DAILY_IP_AUDIT_LIMIT: z.coerce.number().int().positive().default(2),
  DAILY_GLOBAL_AUDIT_LIMIT: z.coerce.number().int().positive().default(50),
  REPORT_TTL_DAYS: z.coerce.number().int().positive().default(7),
});

export type Env = z.infer<typeof envSchema>;

let parsedEnv: Env | null = null;

export function getEnv(): Env {
  if (!parsedEnv) {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
      console.warn("Environment validation warnings:", result.error.format());
      // Fallback with defaults
      parsedEnv = envSchema.parse({
        ...process.env,
        IP_HASH_SECRET: process.env.IP_HASH_SECRET || "development-secret-key-at-least-32-chars-long-12345",
      });
    } else {
      parsedEnv = result.data;
    }
  }
  return parsedEnv;
}
