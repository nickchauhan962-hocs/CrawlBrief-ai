import React from "react";
import { GeminiRecommendation } from "@/lib/schemas/gemini-output";
import { Sparkles, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

interface RecommendationListProps {
  recommendations: GeminiRecommendation[];
  contentObservations?: string[];
  executiveSummary: string;
}

export function RecommendationList({
  recommendations,
  contentObservations = [],
  executiveSummary,
}: RecommendationListProps) {
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-red-950 text-red-300 border border-red-800">High Priority</span>;
      case "medium":
        return <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-950 text-amber-300 border border-amber-800">Medium Priority</span>;
      case "low":
        return <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-950 text-blue-300 border border-blue-800">Low Priority</span>;
      default:
        return <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-slate-800 text-slate-300">Observation</span>;
    }
  };

  return (
    <section className="mb-10">
      {/* Executive Summary Box */}
      <div className="p-6 bg-gradient-to-br from-blue-950/40 via-slate-900/80 to-slate-900 border border-blue-900/40 rounded-xl mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-lg text-slate-100">Executive Brief</h3>
        </div>
        <p className="text-sm sm:text-base text-slate-200 leading-relaxed mb-4">
          {executiveSummary}
        </p>

        {contentObservations.length > 0 && (
          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Key Content & Structural Observations
            </h4>
            <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300">
              {contentObservations.map((obs, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold mt-0.5">•</span>
                  <span>{obs}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Prioritized Action Plan */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-100 mb-2">Recommended Action Plan</h3>
        <p className="text-sm text-slate-400 mb-6">
          Evidence-backed recommendations prioritized by technical impact and implementation difficulty.
        </p>

        <div className="space-y-4">
          {recommendations.length > 0 ? (
            recommendations.map((rec, index) => (
              <div
                key={index}
                className="p-5 bg-slate-900/70 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500">#{index + 1}</span>
                    <h4 className="text-base font-semibold text-slate-100">{rec.title}</h4>
                  </div>
                  {getPriorityBadge(rec.priority)}
                </div>

                <div className="space-y-3 mt-3 text-sm">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                      Why it matters
                    </span>
                    <p className="text-slate-300 text-sm leading-relaxed">{rec.why_it_matters}</p>
                  </div>

                  <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-lg">
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 block mb-1">
                      Suggested Action
                    </span>
                    <p className="text-slate-200 text-sm">{rec.suggested_action}</p>

                    {rec.example && (
                      <div className="mt-2.5 pt-2.5 border-t border-slate-800/80">
                        <span className="text-[11px] font-mono text-slate-500 block mb-1">Example:</span>
                        <code className="text-xs font-mono text-slate-300 bg-slate-900 px-2 py-1 rounded block overflow-x-auto whitespace-pre-wrap">
                          {rec.example}
                        </code>
                      </div>
                    )}
                  </div>
                </div>

                {rec.finding_keys.length > 0 && (
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
                    <span>Tied to deterministic checks:</span>
                    <span className="font-mono text-slate-400">{rec.finding_keys.join(", ")}</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400 italic">No critical action items identified.</p>
          )}
        </div>
      </div>
    </section>
  );
}
