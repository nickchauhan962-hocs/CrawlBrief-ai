"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Copy, Check, ExternalLink, Calendar } from "lucide-react";
import { PrintReportButton } from "./print-report-button";

interface ReportHeaderProps {
  host: string;
  submittedUrl: string;
  createdAt: string;
  expiresAt: string;
  status: "completed" | "partial" | "failed";
}

export function ReportHeader({ host, submittedUrl, createdAt, expiresAt, status }: ReportHeaderProps) {
  const [copied, setCopied] = useState(false);

  const formattedCreated = new Date(createdAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const formattedExpires = new Date(expiresAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/60 pb-8 pt-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 print:hidden">
          <Link
            href="/tools/crawlbrief-ai"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Audit another website</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Link Copied" : "Copy Link"}</span>
            </button>
            <PrintReportButton />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {host}
              </h1>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                  status === "completed"
                    ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/80"
                    : "bg-amber-950/80 text-amber-400 border border-amber-800/80"
                }`}
              >
                {status === "completed" ? "Completed" : "Partial Result"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-400">
              <a
                href={submittedUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="hover:text-blue-400 inline-flex items-center gap-1 transition-colors"
              >
                <span>{submittedUrl}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Audited on {formattedCreated}</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>Link expires on {formattedExpires}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
