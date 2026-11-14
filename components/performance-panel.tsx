import React from "react";
import { Zap, AlertCircle, CheckCircle, Info } from "lucide-react";

interface PerformancePanelProps {
  providerStatus: {
    status: "completed" | "failed" | "skipped";
    error?: string;
    categories?: Record<string, { score: number | null; title?: string }>;
    metrics?: Record<string, { title?: string; displayValue?: string; score?: number | null }>;
  };
}

export function PerformancePanel({ providerStatus }: PerformancePanelProps) {
  if (providerStatus.status !== "completed" || !providerStatus.categories) {
    return (
      <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2 mb-2 text-slate-300">
          <Zap className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold text-base">Mobile Lighthouse Diagnostics</h3>
        </div>
        <p className="text-sm text-slate-400 mb-3">
          {providerStatus.error || "Lighthouse diagnostics were not available for this run."}
        </p>
        <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-400">
          Status: {providerStatus.status}
        </span>
      </div>
    );
  }

  const { categories, metrics = {} } = providerStatus;

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-slate-400 border-slate-700 bg-slate-800";
    if (score >= 90) return "text-emerald-400 border-emerald-800 bg-emerald-950/80";
    if (score >= 50) return "text-amber-400 border-amber-800 bg-amber-950/80";
    return "text-red-400 border-red-800 bg-red-950/80";
  };

  return (
    <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl mb-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-lg text-slate-100">Mobile Lighthouse Diagnostics</h3>
          </div>
          <p className="text-xs text-slate-400">
            Automated audit executed via Google PageSpeed Insights (Mobile Strategy).
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-mono">
          Mobile Emulation
        </span>
      </div>

      {/* Category Scores */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {Object.entries(categories).map(([key, cat]) => (
          <div key={key} className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl text-center">
            <p className="text-xs text-slate-400 mb-2 font-medium capitalize">
              {cat.title || key}
            </p>
            <div
              className={`w-14 h-14 mx-auto rounded-full border-2 flex items-center justify-center text-lg font-bold ${getScoreColor(
                cat.score
              )}`}
            >
              {cat.score !== null ? cat.score : "—"}
            </div>
          </div>
        ))}
      </div>

      {/* Lab Metrics */}
      {Object.keys(metrics).length > 0 && (
        <div className="border-t border-slate-800 pt-5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Simulated Lab Metrics
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.entries(metrics).map(([key, metric]) => (
              <div key={key} className="p-3 bg-slate-950/40 border border-slate-800/60 rounded-lg">
                <span className="text-xs text-slate-400 block mb-0.5">{metric.title || key}</span>
                <span className="text-base font-semibold text-slate-200">
                  {metric.displayValue || "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-start gap-2 text-xs text-slate-500">
        <Info className="w-4 h-4 flex-shrink-0 text-slate-400 mt-0.5" />
        <span>
          <strong>Lighthouse Lab Data Note:</strong> These figures are generated from a controlled mobile emulation in a lab environment. They simulate performance on a mid-tier mobile device over a 4G connection.
        </span>
      </div>
    </div>
  );
}
