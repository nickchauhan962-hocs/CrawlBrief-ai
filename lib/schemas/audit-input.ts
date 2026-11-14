import { z } from "zod";

export const auditInputSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "Website URL is required")
    .max(2048, "URL is too long")
    .refine((val) => {
      try {
        // Prepend https:// if protocol was omitted
        const urlToParse = /^https?:\/\//i.test(val) ? val : `https://${val}`;
        const parsed = new URL(urlToParse);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    }, "Enter a valid public website URL beginning with http:// or https://"),
  turnstileToken: z.string().optional(),
});

export type AuditInput = z.infer<typeof auditInputSchema>;
