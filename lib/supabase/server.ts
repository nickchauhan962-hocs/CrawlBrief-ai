import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getEnv } from "@/lib/env";
import { AuditReport } from "@/lib/schemas/audit-report";

let supabaseInstance: SupabaseClient | null = null;

// In-memory report cache for local testing / offline mode
const inMemoryReports = new Map<string, AuditReport>();

/**
 * Returns a Supabase client configured with the service-role key.
 * Returns null if Supabase environment variables are missing.
 */
export function getSupabaseClient(): SupabaseClient | null {
  const env = getEnv();

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseInstance;
}

/**
 * Saves a compiled audit report into Supabase (or in-memory store).
 */
export async function saveAuditReport(report: AuditReport, tokenHash: string): Promise<void> {
  // Always cache in memory as fallback
  inMemoryReports.set(tokenHash, report);

  const supabase = getSupabaseClient();
  if (!supabase) {
    return;
  }

  try {
    // 1. Insert into public.audits
    const { error: auditError } = await supabase.from("audits").insert({
      id: report.id,
      public_token_hash: tokenHash,
      submitted_url: report.submitted_url,
      normalized_url: report.normalized_url,
      host: report.host,
      status: report.status,
      summary: report.summary,
      category_scores: report.category_scores,
      provider_status: report.provider_status,
      crawl_metadata: report.crawl_metadata,
      error_code: report.error_code || null,
      created_at: report.created_at,
      completed_at: report.completed_at,
      expires_at: report.expires_at,
    });

    if (auditError) {
      console.error("Failed to insert audit record into Supabase:", auditError);
      return;
    }

    // 2. Insert pages into public.audit_pages
    if (report.pages.length > 0) {
      const pageRows = report.pages.map((p) => ({
        audit_id: report.id,
        url: p.url,
        http_status: p.http_status,
        content_type: p.content_type,
        title: p.title,
        meta_description: p.meta_description,
        h1_texts: p.h1_texts,
        heading_outline: p.heading_outline,
        canonical_url: p.canonical_url,
        robots_directives: p.robots_directives,
        html_lang: p.html_lang,
        has_viewport: p.has_viewport,
        word_count: p.word_count,
        image_count: p.image_count,
        images_without_alt: p.images_without_alt,
        internal_link_count: p.internal_link_count,
        external_link_count: p.external_link_count,
        jsonld_types: p.jsonld_types,
        jsonld_parse_errors: p.jsonld_parse_errors,
      }));

      const { error: pagesError } = await supabase.from("audit_pages").insert(pageRows);
      if (pagesError) {
        console.error("Failed to insert audit pages into Supabase:", pagesError);
      }
    }

    // 3. Insert findings into public.audit_findings
    if (report.findings.length > 0) {
      const findingRows = report.findings.map((f) => ({
        audit_id: report.id,
        check_key: f.check_key,
        category: f.category,
        severity: f.severity,
        title: f.title,
        description: f.description,
        evidence: f.evidence,
        recommendation: f.recommendation,
        is_ai_generated: f.is_ai_generated,
      }));

      const { error: findingsError } = await supabase.from("audit_findings").insert(findingRows);
      if (findingsError) {
        console.error("Failed to insert audit findings into Supabase:", findingsError);
      }
    }
  } catch (err) {
    console.error("Database save exception:", err);
  }
}

/**
 * Retrieves an audit report by its SHA-256 token hash.
 */
export async function getAuditReportByTokenHash(tokenHash: string): Promise<AuditReport | null> {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data: audit, error: auditError } = await supabase
        .from("audits")
        .select("*")
        .eq("public_token_hash", tokenHash)
        .single();

      if (auditError || !audit) {
        // Fall back to checking in-memory store
        return inMemoryReports.get(tokenHash) || null;
      }

      // Check expiry
      if (new Date(audit.expires_at).getTime() < Date.now()) {
        return null; // Expired
      }

      // Fetch pages
      const { data: pages = [] } = await supabase
        .from("audit_pages")
        .select("*")
        .eq("audit_id", audit.id);

      // Fetch findings
      const { data: findings = [] } = await supabase
        .from("audit_findings")
        .select("*")
        .eq("audit_id", audit.id);

      // Reassemble report
      return {
        id: audit.id,
        submitted_url: audit.submitted_url,
        normalized_url: audit.normalized_url,
        host: audit.host,
        status: audit.status,
        created_at: audit.created_at,
        completed_at: audit.completed_at,
        expires_at: audit.expires_at,
        summary: audit.summary,
        category_scores: audit.category_scores,
        provider_status: audit.provider_status,
        crawl_metadata: audit.crawl_metadata,
        pages: pages as any,
        findings: findings as any,
        recommendations: audit.summary?.recommendations || [],
        content_observations: audit.summary?.content_observations || [],
        limitations: audit.summary?.limitations || [],
        error_code: audit.error_code,
      };
    } catch (err) {
      console.error("Database query exception:", err);
    }
  }

  // Fallback to in-memory store
  const cached = inMemoryReports.get(tokenHash);
  if (cached) {
    if (new Date(cached.expires_at).getTime() < Date.now()) {
      inMemoryReports.delete(tokenHash);
      return null;
    }
    return cached;
  }

  return null;
}
