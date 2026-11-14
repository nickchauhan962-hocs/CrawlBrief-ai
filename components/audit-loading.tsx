import React from "react";
import { Loader2, Search, ShieldCheck, Sparkles, Cpu } from "lucide-react";

export function AuditLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full border-4 border-slate-700/60 border-t-blue-500 animate-spin flex items-center justify-center" />
        <div className="absolute inset-0 flex items-center justify-center text-blue-400">
          <Search className="w-8 h-8" />
        </div>
      </div>

      <h3 className="text-xl font-semibold text-slate-100 mb-2">
        Inspecting public pages and preparing your report
      </h3>
      <p className="text-sm text-slate-400 max-w-md mx-auto mb-8">
        Discovering same-origin HTML pages, executing deterministic SEO & schema checks, and running PageSpeed mobile diagnostics.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg text-left">
        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div className="text-xs">
            <p className="font-medium text-slate-200">Safe Crawler</p>
            <p className="text-slate-400">Respecting robots.txt</p>
          </div>
        </div>

        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center gap-3">
          <Cpu className="w-5 h-5 text-blue-400 flex-shrink-0" />
          <div className="text-xs">
            <p className="font-medium text-slate-200">Technical Checks</p>
            <p className="text-slate-400">Deterministic signals</p>
          </div>
        </div>

        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0" />
          <div className="text-xs">
            <p className="font-medium text-slate-200">AI Explanations</p>
            <p className="text-slate-400">Evidence-backed insights</p>
          </div>
        </div>
      </div>
    </div>
  );
}
