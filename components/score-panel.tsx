import React from "react";
import { CategoryScore } from "@/lib/schemas/audit-report";
import { Shield, FileText, Database, Zap, HelpCircle } from "lucide-react";

interface ScorePanelProps {
  categoryScores: Record<string, CategoryScore>;
  heuristicScore: number | null;
  counts: {
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  pagesCrawled: number;
}

export function ScorePanel({ categoryScores, heuristicScore, counts, pagesCrawled }: ScorePanelProps) {
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "good":
        return <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">Healthy</span>;
      case "needs_improvement":
        return <span className="text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">Review</span>;
      case "poor":
        return <span className="text-xs px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">Needs Attention</span>;
      default:
        return <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">Not Measured</span>;
    }
  };

  return (
    <section className="mb-10">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Pages Crawled</p>
          <p className="text-2xl font-bold text-slate-100">{pagesCrawled}</p>
          <p className="text-xs text-slate-500 mt-1">Same-origin HTML</p>
        </div>

        <div className="p-4 bg-slate-900/70 border border-red-950/60 rounded-xl">
          <p className="text-xs text-red-400 font-medium uppercase tracking-wider mb-1">High Severity</p>
          <p className="text-2xl font-bold text-red-400">{counts.high}</p>
          <p className="text-xs text-slate-500 mt-1">Crawl/index blockers</p>
        </div>

        <div className="p-4 bg-slate-900/70 border border-amber-950/60 rounded-xl">
          <p className="text-xs text-amber-400 font-medium uppercase tracking-wider mb-1">Medium Severity</p>
          <p className="text-2xl font-bold text-amber-400">{counts.medium}</p>
          <p className="text-xs text-slate-500 mt-1">Optimization items</p>
        </div>

        <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl">
          <p className="text-xs text-blue-400 font-medium uppercase tracking-wider mb-1">Heuristic Score</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-100">{heuristicScore ?? "N/A"}</span>
            <span className="text-xs text-slate-500">/ 100</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Observable checks average</p>
        </div>
      </div>

      {/* Category Breakdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Technical SEO */}
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <h3 className="font-semibold text-slate-200 text-sm">Technical SEO</h3>
              </div>
              {getStatusBadge(categoryScores["technical"]?.status)}
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Status codes, title tags, meta descriptions, robots directives, canonical tags, and mobile viewport.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Score</span>
            <span className="font-bold text-slate-200">{categoryScores["technical"]?.score ?? "N/A"}%</span>
          </div>
        </div>

        {/* Content Structure */}
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <h3 className="font-semibold text-slate-200 text-sm">Content Structure</h3>
              </div>
              {getStatusBadge(categoryScores["content"]?.status)}
            </div>
            <p className="text-xs text-slate-400 mb-4">
              H1 headings hierarchy, outline integrity, visible word count, and title/description lengths.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Score</span>
            <span className="font-bold text-slate-200">{categoryScores["content"]?.score ?? "N/A"}%</span>
          </div>
        </div>

        {/* Structured Data */}
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-400" />
                <h3 className="font-semibold text-slate-200 text-sm">Structured Data</h3>
              </div>
              {getStatusBadge(categoryScores["schema"]?.status)}
            </div>
            <p className="text-xs text-slate-400 mb-4">
              JSON-LD schema presence, @type entity signals, and syntax parse integrity.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Score</span>
            <span className="font-bold text-slate-200">{categoryScores["schema"]?.score ?? "N/A"}%</span>
          </div>
        </div>

        {/* Performance (PageSpeed) */}
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h3 className="font-semibold text-slate-200 text-sm">Mobile Performance</h3>
              </div>
              {getStatusBadge(categoryScores["performance"]?.status)}
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Lighthouse mobile simulation lab metrics for landing page speed and Core Web Vitals signals.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Lighthouse</span>
            <span className="font-bold text-slate-200">
              {categoryScores["performance"]?.score !== null ? `${categoryScores["performance"]?.score}%` : "Not measured"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 mt-4 p-3 bg-slate-900/40 border border-slate-800/60 rounded-lg text-xs text-slate-500">
        <HelpCircle className="w-4 h-4 flex-shrink-0 text-slate-400 mt-0.5" />
        <span>
          <strong>Methodology note:</strong> Scores represent observable technical heuristics on the inspected pages. They are not a guarantee or prediction of search engine ranking.
        </span>
      </div>
    </section>
  );
}
