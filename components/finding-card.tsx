import React from "react";
import { Finding } from "@/lib/schemas/audit-report";
import { AlertTriangle, AlertCircle, Info, CheckCircle2, ChevronRight, ExternalLink } from "lucide-react";

interface FindingCardProps {
  finding: Finding;
}

export function FindingCard({ finding }: FindingCardProps) {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-red-950/80 text-red-300 border border-red-800/80">
            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
            <span>High Severity</span>
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-amber-950/80 text-amber-300 border border-amber-800/80">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Medium Severity</span>
          </span>
        );
      case "low":
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-blue-950/80 text-blue-300 border border-blue-800/80">
            <Info className="w-3.5 h-3.5 text-blue-400" />
            <span>Low Priority</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-slate-800 text-slate-300 border border-slate-700">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Notice</span>
          </span>
        );
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "technical":
        return "Technical SEO";
      case "content":
        return "Content & Headings";
      case "schema":
        return "Structured Data";
      case "performance":
        return "Performance";
      default:
        return cat;
    }
  };

  return (
    <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-2.5">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-1 block">
            {getCategoryLabel(finding.category)} • {finding.check_key}
          </span>
          <h4 className="text-base font-semibold text-slate-100">{finding.title}</h4>
        </div>
        <div>{getSeverityBadge(finding.severity)}</div>
      </div>

      <p className="text-sm text-slate-300 mb-3">{finding.description}</p>

      {finding.page_url && (
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3 font-mono break-all">
          <span className="text-slate-500">Page:</span>
          <a
            href={finding.page_url}
            target="_blank"
            rel="noreferrer noopener"
            className="text-blue-400 hover:underline inline-flex items-center gap-1"
          >
            <span>{finding.page_url}</span>
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
        </div>
      )}

      {/* Measured Evidence */}
      {finding.evidence && Object.keys(finding.evidence).length > 0 && (
        <div className="mb-3 p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg text-xs font-mono text-slate-400">
          <span className="text-slate-500 block mb-1 font-sans text-[11px] font-medium uppercase">
            Measured Evidence
          </span>
          <pre className="overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(finding.evidence, null, 2)}
          </pre>
        </div>
      )}

      {/* Practical Action */}
      {finding.recommendation && (
        <div className="flex items-start gap-2 pt-3 border-t border-slate-800/60 text-xs text-slate-300">
          <span className="font-semibold text-blue-400 flex-shrink-0">Next step:</span>
          <span>{finding.recommendation}</span>
        </div>
      )}
    </div>
  );
}
