import React from "react";
import { Database, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { PageFact } from "@/lib/schemas/audit-report";

interface SchemaPanelProps {
  pages: PageFact[];
}

export function SchemaPanel({ pages }: SchemaPanelProps) {
  const landing = pages[0];
  const allDetectedTypes = Array.from(new Set(pages.flatMap((p) => p.jsonld_types)));
  const allParseErrors = pages.flatMap((p) => p.jsonld_parse_errors);

  return (
    <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl mb-10">
      <div className="flex items-center gap-2 mb-2">
        <Database className="w-5 h-5 text-purple-400" />
        <h3 className="font-semibold text-lg text-slate-100">Structured Data Signals</h3>
      </div>
      <p className="text-xs text-slate-400 mb-6">
        Detects JSON-LD script blocks, extracts declared schema.org entity types, and verifies syntax validity.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Discovered Entities */}
        <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-3">
            Discovered Schema Types
          </span>
          {allDetectedTypes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {allDetectedTypes.map((type) => (
                <span
                  key={type}
                  className="px-3 py-1 bg-purple-950/70 border border-purple-800/70 text-purple-300 rounded-lg text-xs font-mono font-medium"
                >
                  {type}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">
              No JSON-LD schema entity types were detected across the inspected pages.
            </p>
          )}
        </div>

        {/* Syntax & Parsing Status */}
        <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-3">
            JSON-LD Syntax Integrity
          </span>
          {allParseErrors.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-red-400 font-medium">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Parse errors discovered in structured data:</span>
              </div>
              <ul className="text-xs text-slate-400 font-mono list-disc list-inside space-y-1">
                {allParseErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <CheckCircle className="w-4 h-4" />
              <span>All detected JSON-LD blocks parsed cleanly without syntax errors.</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-3 bg-slate-900/40 border border-slate-800/60 rounded-lg flex items-start gap-2 text-xs text-slate-500">
        <Info className="w-4 h-4 flex-shrink-0 text-slate-400 mt-0.5" />
        <span>
          <strong>Scope Notice:</strong> CrawlBrief AI inspects embedded JSON-LD blocks for syntax validity and @type entity declarations. It does not certify full Schema.org semantic compliance or Google Rich Result eligibility.
        </span>
      </div>
    </div>
  );
}
