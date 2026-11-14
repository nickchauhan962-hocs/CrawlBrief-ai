import { z } from "zod";

export const geminiRecommendationSchema = z.object({
  finding_keys: z.array(z.string()).default([]),
  priority: z.enum(["high", "medium", "low", "info"]),
  title: z.string().min(1).max(120),
  why_it_matters: z.string().min(1).max(400),
  suggested_action: z.string().min(1).max(500),
  example: z.string().max(500).optional().default(""),
});

export const geminiOutputSchema = z.object({
  executive_summary: z.string().min(1).max(1000),
  content_observations: z.array(z.string()).max(5).default([]),
  recommendations: z.array(geminiRecommendationSchema).max(8).default([]),
  limitations: z.array(z.string()).max(4).default([]),
});

export type GeminiRecommendation = z.infer<typeof geminiRecommendationSchema>;
export type GeminiOutput = z.infer<typeof geminiOutputSchema>;
