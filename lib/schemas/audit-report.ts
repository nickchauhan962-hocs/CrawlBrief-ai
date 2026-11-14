import { z } from "zod";
import { geminiRecommendationSchema } from "./gemini-output";

export const pageFactSchema = z.object({
  id: z.string().optional(),
  url: z.string().url(),
  http_status: z.number().int().nullable().default(200),
  content_type: z.string().nullable().default("text/html"),
  title: z.string().nullable().default(""),
  meta_description: z.string().nullable().default(""),
  h1_texts: z.array(z.string()).default([]),
  heading_outline: z
    .array(
      z.object({
        level: z.number().int().min(1).max(6),
        text: z.string(),
      })
    )
    .default([]),
  canonical_url: z.string().nullable().default(null),
  robots_directives: z.array(z.string()).default([]),
  html_lang: z.string().nullable().default(null),
  has_viewport: z.boolean().default(false),
  word_count: z.number().int().default(0),
  image_count: z.number().int().default(0),
  images_without_alt: z.number().int().default(0),
  internal_link_count: z.number().int().default(0),
  external_link_count: z.number().int().default(0),
  jsonld_types: z.array(z.string()).default([]),
  jsonld_parse_errors: z.array(z.string()).default([]),
  text_sample: z.string().optional().default(""),
});

export const findingSchema = z.object({
  id: z.string().optional(),
  page_id: z.string().optional(),
  page_url: z.string().optional(),
  check_key: z.string(),
  category: z.enum(["technical", "performance", "schema", "content", "ai_opportunity"]),
  severity: z.enum(["high", "medium", "low", "info"]),
  title: z.string(),
  description: z.string(),
  evidence: z.record(z.any()).optional(),
  recommendation: z.string().optional(),
  is_ai_generated: z.boolean().optional(),
});

export const categoryScoreSchema = z.object({
  score: z.number().min(0).max(100).nullable(),
  status: z.enum(["good", "needs_improvement", "poor", "unmeasured"]),
  passed: z.number().default(0),
  issues: z.number().default(0),
});

export const auditReportSchema = z.object({
  id: z.string(),
  public_token: z.string().optional(), // only populated for creation response
  submitted_url: z.string(),
  normalized_url: z.string(),
  host: z.string(),
  status: z.enum(["completed", "partial", "failed"]),
  created_at: z.string(),
  completed_at: z.string().nullable(),
  expires_at: z.string(),
  summary: z.object({
    executive_summary: z.string(),
    pages_crawled: z.number(),
    high_count: z.number(),
    medium_count: z.number(),
    low_count: z.number(),
    info_count: z.number(),
    heuristic_score: z.number().nullable(),
  }),
  category_scores: z.record(categoryScoreSchema).default({}),
  provider_status: z.object({
    pagespeed: z.object({
      status: z.enum(["completed", "failed", "skipped"]),
      error: z.string().optional(),
      categories: z
        .record(
          z.object({
            score: z.number().nullable(),
            title: z.string().optional(),
          })
        )
        .optional(),
      metrics: z.record(z.any()).optional(),
    }),
    gemini: z.object({
      status: z.enum(["completed", "failed", "skipped"]),
      error: z.string().optional(),
    }),
  }),
  crawl_metadata: z.object({
    pages_attempted: z.number(),
    pages_fetched: z.number(),
    robots_status: z.string(),
    crawl_limitations: z.array(z.string()).default([]),
  }),
  pages: z.array(pageFactSchema),
  findings: z.array(findingSchema),
  recommendations: z.array(geminiRecommendationSchema).default([]),
  content_observations: z.array(z.string()).default([]),
  limitations: z.array(z.string()).default([]),
  error_code: z.string().nullable().optional(),
});

export type PageFact = z.infer<typeof pageFactSchema>;
export type Finding = z.infer<typeof findingSchema>;
export type CategoryScore = z.infer<typeof categoryScoreSchema>;
export type AuditReport = z.infer<typeof auditReportSchema>;
