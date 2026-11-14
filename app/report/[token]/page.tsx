import React from "react";
import { notFound } from "next/navigation";
import { hashReportToken } from "@/lib/report/assemble";
import { getAuditReportByTokenHash } from "@/lib/supabase/server";
import { ReportHeader } from "@/components/report-header";
import { ScorePanel } from "@/components/score-panel";
import { FindingCard } from "@/components/finding-card";
import { PerformancePanel } from "@/components/performance-panel";
import { SchemaPanel } from "@/components/schema-panel";
import { RecommendationList } from "@/components/recommendation-list";
import { Shield, FileText, AlertCircle, AlertTriangle, ExternalLink, HelpCircle, Layers } from "lucide-react";

interface ReportPageProps {
  params: Promise<{ token: string }>;
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { token } = await params;

  if (!token || typeof token !== "string" || token.length < 16) {
    notFound();
  }

  const tokenHash = hashReportToken(token);
  const report = await getAuditReportByTokenHash(tokenHash);

  if (!report) {
    notFound();
  }

  const technicalFindings = report.findings.filter((f) => f.category === "technical");
  const contentFindings = report.findings.filter((f) => f.category === "content");
  const schemaFindings = report.findings.filter((f) => f.category === "schema");

  return (
    <div className="pb-24">
      {/* Report Header */}
      <ReportHeader
        host={report.host}
        submittedUrl={report.submitted_url}
        createdAt={report.created_at}
        expiresAt={report.expires_at}
        status={report.status}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10">
        {/* At-a-glance Score Panel */}
        <ScorePanel
          categoryScores={report.category_scores}
          heuristicScore={report.summary.heuristic_score}
          counts={{
            high: report.summary.high_count,
            medium: report.summary.medium_count,
            low: report.summary.low_count,
            info: report.summary.info_count,
          }}
          pagesCrawled={report.summary.pages_crawled}
        />

        {/* Action Plan & Executive Brief */}
        <RecommendationList
          recommendations={report.recommendations}
          contentObservations={report.content_observations}
          executiveSummary={report.summary.executive_summary}
        />

        {/* Mobile Lighthouse Diagnostics */}
        <PerformancePanel providerStatus={report.provider_status.pagespeed} />

        {/* Structured Data Signals */}
        <SchemaPanel pages={report.pages} />

        {/* Deterministic Technical Findings Grouped by Category */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <h3 className="text-xl font-bold text-slate-100">Technical SEO Findings</h3>
          </div>
          <p className="text-xs text-slate-400 mb-6">
            Detailed inspection of HTTP response headers, meta directives, canonical signals, and indexability rules.
          </p>

          <div className="space-y-4">
            {technicalFindings.length > 0 ? (
              technicalFindings.map((finding) => (
                <FindingCard key={finding.id || finding.check_key} finding={finding} />
              ))
            ) : (
              <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-xl text-center text-slate-400 text-sm">
                No technical SEO issues were detected across the inspected pages.
              </div>
            )}
          </div>
        </div>

        {/* Content Structure Findings */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h3 className="text-xl font-bold text-slate-100">Content Structure & Headings</h3>
          </div>
          <p className="text-xs text-slate-400 mb-6">
            Evaluation of H1 tags, heading outlines, visible-text word count estimates, and image alt text coverage.
          </p>

          <div className="space-y-4">
            {contentFindings.length > 0 ? (
              contentFindings.map((finding) => (
                <FindingCard key={finding.id || finding.check_key} finding={finding} />
              ))
            ) : (
              <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-xl text-center text-slate-400 text-sm">
                No content structure defects detected on inspected pages.
              </div>
            )}
          </div>
        </div>

        {/* Inspected Pages Outline */}
        <div className="mb-12 p-6 bg-slate-900/60 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-slate-100">Inspected Pages Summary</h3>
          </div>
          <p className="text-xs text-slate-400 mb-6">
            Overview of the {report.pages.length} same-origin HTML page(s) analyzed during this audit.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Page URL</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">H1 Count</th>
                  <th className="py-2.5 px-3">Words</th>
                  <th className="py-2.5 px-3">Images (Missing Alt)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {report.pages.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="py-3 px-3 max-w-[240px] truncate">
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <span className="truncate">{p.url}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          p.http_status === 200
                            ? "bg-emerald-950 text-emerald-400"
                            : "bg-red-950 text-red-400"
                        }`}
                      >
                        {p.http_status ?? "Err"}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-300 max-w-[180px] truncate">
                      {p.title || <span className="text-red-400 italic">None</span>}
                    </td>
                    <td className="py-3 px-3">{p.h1_texts.length}</td>
                    <td className="py-3 px-3">~{p.word_count}</td>
                    <td className="py-3 px-3">
                      {p.image_count} ({p.images_without_alt})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Limitations & Audit Boundary Notice */}
        <div className="p-6 bg-slate-950/70 border border-slate-800/80 rounded-xl text-xs text-slate-400 mb-8">
          <div className="flex items-center gap-2 mb-2 text-slate-200 font-semibold text-sm">
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <span>Audit Scope & Known Limitations</span>
          </div>
          <ul className="list-disc list-inside space-y-1.5 text-slate-400 mb-3">
            {report.limitations.map((lim, idx) => (
              <li key={idx}>{lim}</li>
            ))}
          </ul>
          <p className="text-[11px] text-slate-500 pt-3 border-t border-slate-800/60">
            CrawlBriefBot operates strictly as a low-volume diagnostic crawler and respects robots.txt directives. Report data expires in 7 days.
          </p>
        </div>
      </div>
    </div>
  );
}
