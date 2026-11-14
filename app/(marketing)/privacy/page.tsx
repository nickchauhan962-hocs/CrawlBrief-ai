import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/tools/crawlbrief-ai"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to audit tool</span>
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-7 h-7 text-blue-400" />
          <h1 className="text-3xl font-bold text-white tracking-tight">Privacy Notice</h1>
        </div>
        <p className="text-xs text-slate-500 mb-8">Last updated: 14 November 2026</p>

        <div className="space-y-8 text-slate-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-slate-100 mb-2">1. Data Handling & Crawling</h2>
            <p className="text-slate-400 mb-2">
              CrawlBrief AI is designed for public websites. When you submit a URL for analysis, our crawler (identified as <code>CrawlBriefBot</code>) fetches up to 5 publicly accessible HTML pages on that same origin.
            </p>
            <p className="text-slate-400">
              We do <strong>not</strong> store full HTML source code, CSS, images, cookies, session headers, or entire page copy in our database. We only store normalized URLs, structured metadata (such as titles, headings outline, and status codes), and calculated findings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-100 mb-2">2. Google Gemini API Data Processing</h2>
            <p className="text-slate-400 mb-2">
              To produce prioritized executive briefs and recommendations, limited excerpts of extracted visible text (bounded to a maximum of 1,500 characters per page) and deterministic finding summaries are sent to the Google Gemini API.
            </p>
            <p className="text-slate-400 mb-2">
              <strong>Important Provider Disclosure:</strong> Depending on Google Gemini API account tiers, submitted content may be processed by Google in accordance with Google’s API Terms of Service.
            </p>
            <p className="text-slate-400">
              Therefore, you should only submit public website URLs that you own or are authorized to audit. <strong>Do not submit private staging environments, intranets, password-protected portals, or confidential internal URLs.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-100 mb-2">3. IP Address Hashing & Rate Limiting</h2>
            <p className="text-slate-400">
              To prevent abuse and manage service quotas, we calculate an HMAC-SHA256 one-way cryptographic hash of incoming client IP addresses using a secure server-side secret. <strong>Raw IP addresses are never saved into database tables or log files.</strong> Daily counter buckets are automatically pruned.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-100 mb-2">4. Report Retention & Deletion</h2>
            <p className="text-slate-400">
              Audit reports are stored under a high-entropy 192-bit cryptographic bearer token and expire automatically after <strong>7 days</strong>. Expired reports and associated findings are permanently deleted.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-100 mb-2">5. Abuse Inquiries</h2>
            <p className="text-slate-400">
              If you are a site owner wishing to request expedited deletion of an audit report or report unwanted bot traffic, please contact Niket Chauhan via niketchauhan.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
