import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldAlert, Cpu, Eye, Lock, Clock } from "lucide-react";

export default function HowItWorksPage() {
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

        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
          How CrawlBrief AI Works: Methodology & Scope
        </h1>
        <p className="text-slate-400 text-base leading-relaxed mb-10">
          CrawlBrief AI is designed around an evidence-first philosophy. We believe website audits should be transparent, repeatable, and grounded in observable page facts — not opaque or misleading vanity scores.
        </p>

        <div className="space-y-10 text-slate-300 text-sm leading-relaxed">
          {/* Section 1 */}
          <section className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-2 mb-3 text-blue-400">
              <Cpu className="w-5 h-5" />
              <h2 className="text-lg font-semibold text-slate-100">1. Evidence-First Audit Engine</h2>
            </div>
            <p className="mb-3">
              Every technical check in CrawlBrief AI is calculated deterministically by application code. We do not allow generative AI to invent or guess whether a technical issue exists.
            </p>
            <p>
              Each reported issue is directly linked to structured measured evidence (such as the exact HTTP response code, character counts, or heading hierarchy) extracted directly from the HTML response.
            </p>
          </section>

          {/* Section 2 */}
          <section className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-2 mb-3 text-purple-400">
              <Eye className="w-5 h-5" />
              <h2 className="text-lg font-semibold text-slate-100">2. Crawl Scope & Constraints</h2>
            </div>
            <ul className="space-y-2 list-disc list-inside text-slate-400">
              <li><strong className="text-slate-200">5 Same-Origin Pages:</strong> The crawler inspects at most 5 same-origin HTML pages to deliver swift results within 45 seconds while minimizing server load.</li>
              <li><strong className="text-slate-200">Robots.txt Respect:</strong> Before inspecting any page, we fetch and parse <code>/robots.txt</code> and strictly obey Disallow directives for <code>CrawlBriefBot</code> and wildcard agents.</li>
              <li><strong className="text-slate-200">Static HTML Only:</strong> CrawlBrief does not execute client-side JavaScript (SPAs). Sites that render content entirely through client-side hydration may report low text volume.</li>
              <li><strong className="text-slate-200">2MB Body Cap:</strong> Individual pages exceeding 2MB of HTML are stopped to protect system throughput.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-2 mb-3 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
              <h2 className="text-lg font-semibold text-slate-100">3. Non-Goals & Disclaimers</h2>
            </div>
            <p className="mb-3">To maintain complete transparency with website owners:</p>
            <ul className="space-y-1.5 list-disc list-inside text-slate-400 mb-3">
              <li>We do <strong>not</strong> guarantee search engine rankings or indexation.</li>
              <li>We do <strong>not</strong> promise that ChatGPT, Gemini, Perplexity, or any AI assistant will cite or recommend a website.</li>
              <li>We do <strong>not</strong> certify full Schema.org compliance — our structured data check only discovers JSON-LD types and tests JSON parsing validity.</li>
              <li>Lighthouse scores represent simulated lab conditions on mobile and should not be confused with real-user field data (CrUX).</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-2 mb-3 text-emerald-400">
              <Lock className="w-5 h-5" />
              <h2 className="text-lg font-semibold text-slate-100">4. Security & SSRF Protection</h2>
            </div>
            <p className="mb-3">
              Because CrawlBrief AI accepts public URL input, outbound fetches are heavily isolated:
            </p>
            <ul className="space-y-1.5 list-disc list-inside text-slate-400">
              <li>All destination hostnames undergo DNS resolution against a strict public IP filter.</li>
              <li>Loopback, RFC1918 private subnets, link-local metadata addresses (e.g. 169.254.169.254), and internal cloud endpoints are strictly blocked.</li>
              <li>Redirects are manually inspected and re-validated up to 3 hops; cross-origin redirects are blocked.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-2 mb-3 text-slate-300">
              <Clock className="w-5 h-5" />
              <h2 className="text-lg font-semibold text-slate-100">5. Retention & Expiry</h2>
            </div>
            <p>
              Reports are identified by a 192-bit cryptographic bearer token and are permanently deleted after <strong>7 days</strong>. We never store raw webpage HTML or full page text.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
