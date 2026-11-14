"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AuditUrlForm } from "@/components/audit-url-form";
import { AuditLoading } from "@/components/audit-loading";
import { Shield, Zap, Database, FileText, CheckCircle2, ArrowRight } from "lucide-react";

export default function CrawlBriefLandingPage() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="py-12 sm:py-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/70 border border-blue-800/60 text-blue-300 text-xs font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span>v1.0 Public Beta • Powered by Gemini & PageSpeed</span>
        </div>

        {/* Hero Headline & Subhead */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          Know what’s holding your website back.
        </h1>
        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Run a practical, evidence-backed audit covering technical SEO, mobile Lighthouse performance, structured data signals, and AI-assisted action items.
        </p>

        {/* Audit Form or Indeterminate Loading */}
        <div className="mb-16">
          {isLoading ? (
            <AuditLoading />
          ) : (
            <AuditUrlForm onStartLoading={() => setIsLoading(true)} />
          )}
        </div>

        {/* How It Works (3 Steps) */}
        <div className="pt-12 border-t border-slate-800/80 mb-20">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-8">
            How CrawlBrief AI Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-blue-900/50 border border-blue-700/60 flex items-center justify-center font-bold text-blue-300 text-sm mb-3">
                1
              </div>
              <h3 className="font-semibold text-slate-100 text-base mb-1">Enter Public URL</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Provide any public website URL. Our crawler verifies robots.txt permissions and ensures zero SSRF traversal.
              </p>
            </div>

            <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-purple-900/50 border border-purple-700/60 flex items-center justify-center font-bold text-purple-300 text-sm mb-3">
                2
              </div>
              <h3 className="font-semibold text-slate-100 text-base mb-1">Inspect 5 Same-Origin Pages</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Extracts metadata, headings, JSON-LD, and runs a mobile PageSpeed audit to capture lab performance metrics.
              </p>
            </div>

            <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-emerald-900/50 border border-emerald-700/60 flex items-center justify-center font-bold text-emerald-300 text-sm mb-3">
                3
              </div>
              <h3 className="font-semibold text-slate-100 text-base mb-1">Get Actionable Report</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Review prioritized, evidence-backed recommendations grounded in deterministic findings, ready to export as PDF.
              </p>
            </div>
          </div>
        </div>

        {/* What We Check Cards */}
        <div className="mb-20 text-left">
          <h2 className="text-2xl font-bold text-slate-100 mb-2 text-center">
            What We Check
          </h2>
          <p className="text-sm text-slate-400 text-center mb-8 max-w-xl mx-auto">
            Deterministic code checks backed by measurable page evidence — not unexplained opaque scores.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl">
              <div className="flex items-center gap-2 mb-2 text-blue-400 font-semibold text-sm">
                <Shield className="w-4 h-4" />
                <span>Technical SEO & Indexability</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Validates HTTP status codes, title presence & lengths, meta descriptions, robots directives (noindex/nofollow), canonical links, viewport, and language tags.
              </p>
              <ul className="text-xs text-slate-400 space-y-1">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <span>Indexation directives & robots.txt parsing</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <span>Title & description snippet optimization</span>
                </li>
              </ul>
            </div>

            <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl">
              <div className="flex items-center gap-2 mb-2 text-amber-400 font-semibold text-sm">
                <Zap className="w-4 h-4" />
                <span>Mobile Lighthouse Performance</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Executes mobile strategy PageSpeed audits for the landing page, extracting simulated lab metrics including FCP, LCP, CLS, and Total Blocking Time.
              </p>
              <ul className="text-xs text-slate-400 space-y-1">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Core Web Vitals lab diagnostics</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Accessibility & best-practices scores</span>
                </li>
              </ul>
            </div>

            <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl">
              <div className="flex items-center gap-2 mb-2 text-purple-400 font-semibold text-sm">
                <Database className="w-4 h-4" />
                <span>Structured Data Signals</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Detects embedded JSON-LD scripts, verifies JSON syntax integrity, and extracts declared schema.org entity types without making false conformance claims.
              </p>
              <ul className="text-xs text-slate-400 space-y-1">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                  <span>Entity discovery (@type extraction)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                  <span>Syntax error detection</span>
                </li>
              </ul>
            </div>

            <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl">
              <div className="flex items-center gap-2 mb-2 text-emerald-400 font-semibold text-sm">
                <FileText className="w-4 h-4" />
                <span>Content & Heading Outline</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Evaluates H1 heading presence, hierarchical outline flow (H1-H6), visible-text volume estimation, and image alt attribute coverage.
              </p>
              <ul className="text-xs text-slate-400 space-y-1">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Hierarchical heading structure</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Image alt coverage inspection</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Methodology Link Callout */}
        <div className="p-6 bg-slate-900/30 border border-slate-800/80 rounded-xl text-center">
          <p className="text-sm text-slate-300 mb-2">
            Want to understand our crawl constraints, rate limits, and scoring formulas?
          </p>
          <Link
            href="/tools/crawlbrief-ai/how-it-works"
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>Read How It Works & Methodology</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
