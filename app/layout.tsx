import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "CrawlBrief AI — Practical Website Technical SEO & Performance Audits",
  description:
    "Free, evidence-backed technical SEO audit tool covering crawlability, Lighthouse mobile performance, structured data, and AI-assisted prioritized recommendations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="flex flex-col min-h-screen bg-[#080d1a] text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        {/* Navigation Bar */}
        <nav className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50 print:hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link href="/tools/crawlbrief-ai" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-900/40">
                CB
              </div>
              <span className="font-bold text-lg tracking-tight text-white">
                CrawlBrief <span className="text-blue-400">AI</span>
              </span>
            </Link>

            <div className="flex items-center gap-6 text-sm text-slate-400 font-medium">
              <Link
                href="/tools/crawlbrief-ai/how-it-works"
                className="hover:text-slate-200 transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="/privacy"
                className="hover:text-slate-200 transition-colors"
              >
                Privacy
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow">{children}</main>

        {/* Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-950/60 py-8 text-xs text-slate-500 print:hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© 2026 CrawlBrief AI. Built by Niket Chauhan.</p>
            <div className="flex items-center gap-5">
              <Link href="/tools/crawlbrief-ai/how-it-works" className="hover:text-slate-400 transition-colors">
                Methodology & Limits
              </Link>
              <Link href="/privacy" className="hover:text-slate-400 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-slate-400 transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
