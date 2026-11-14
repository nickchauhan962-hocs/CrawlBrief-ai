import React from "react";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsPage() {
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
          <FileText className="w-7 h-7 text-blue-400" />
          <h1 className="text-3xl font-bold text-white tracking-tight">Terms of Use & Acceptable Use Policy</h1>
        </div>
        <p className="text-xs text-slate-500 mb-8">Last updated: 14 November 2026</p>

        <div className="space-y-8 text-slate-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-slate-100 mb-2">1. Permitted Use</h2>
            <p className="text-slate-400">
              CrawlBrief AI is provided as a free public utility for technical website auditing, education, and diagnosis. You agree to use the service only for public websites that you own, operate, or have authorized permission to audit.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-100 mb-2">2. Prohibited Activities</h2>
            <p className="text-slate-400 mb-2">You must not submit:</p>
            <ul className="space-y-1 list-disc list-inside text-slate-400">
              <li>Internal private IPs, local subnets (localhost, 127.0.0.1, RFC1918), or cloud metadata endpoints.</li>
              <li>Websites you do not have permission or legitimate interest to evaluate.</li>
              <li>High-frequency automated bot requests designed to bypass rate limits or exhaust service quotas.</li>
              <li>Malicious payloads, prompt injections, or unauthorized scan vectors.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-100 mb-2">3. No Guarantee or Warranty</h2>
            <p className="text-slate-400 mb-2">
              The services, scoring heuristics, and AI recommendations are provided strictly &quot;as is&quot; without warranty of any kind.
            </p>
            <p className="text-slate-400">
              CrawlBrief AI does not guarantee search engine ranking, indexing status, organic traffic improvements, or AI assistant citations. Recommendations represent general best practices and should be evaluated in your specific website context.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-100 mb-2">4. Service Availability & Limits</h2>
            <p className="text-slate-400">
              We reserve the right to throttle, restrict, or suspend access to any IP address or host that violates acceptable use policies or threatens service stability. Daily IP and global quotas are enforced automatically.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
