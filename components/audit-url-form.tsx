"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Globe, AlertCircle, Loader2 } from "lucide-react";

interface AuditUrlFormProps {
  onStartLoading?: () => void;
  onError?: (msg: string) => void;
}

export function AuditUrlForm({ onStartLoading, onError }: AuditUrlFormProps) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setErrorMessage("Enter a valid public website URL beginning with http:// or https://");
      return;
    }

    setIsLoading(true);
    if (onStartLoading) onStartLoading();

    try {
      const res = await fetch("/api/audits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "An error occurred while generating the audit.");
      }

      if (data.reportUrl) {
        router.push(data.reportUrl);
      } else {
        throw new Error("Invalid response from server: Missing report URL");
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || "Failed to initiate audit. Please try again.");
      if (onError) onError(err.message);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="relative flex items-center bg-slate-900/90 border border-slate-700/80 rounded-xl p-1.5 shadow-2xl focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
          <div className="pl-3 text-slate-400">
            <Globe className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
            placeholder="https://example.com"
            aria-label="Website URL"
            className="w-full px-3 py-3 bg-transparent text-slate-100 placeholder-slate-500 text-base focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Auditing...</span>
              </>
            ) : (
              <>
                <span>Run Audit</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-2.5 p-3.5 bg-red-950/60 border border-red-800/80 rounded-lg text-red-200 text-sm animate-in fade-in"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}
      </form>

      <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-400">
        <span>Free</span>
        <span>•</span>
        <span>No account required</span>
        <span>•</span>
        <span>Up to 5 same-origin pages</span>
      </div>
    </div>
  );
}
