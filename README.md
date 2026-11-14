# CrawlBrief AI

**AI-Powered Technical SEO, Performance & Structured Data Auditor**

Built by [Niket Chauhan](https://niketchauhan.com)

---

## 1. Product Overview

CrawlBrief AI is a free, public website audit tool that inspects technical SEO health, PageSpeed/Lighthouse mobile signals, structured data (JSON-LD), and content hierarchy. A visitor inputs any public URL and receives a transparent, evidence-backed report with prioritized actionable recommendations and an AI-assisted executive brief powered by Google Gemini.

### Key Capabilities
- **Safe Same-Origin Crawling:** Inspects up to 5 same-origin HTML pages while strictly honoring `robots.txt` disallow rules.
- **SSRF Safeguards:** DNS resolution and IP verification reject loopback, RFC1918 private subnets, link-local metadata addresses (`169.254.169.254`), and non-standard ports.
- **Evidence-First Scoring:** Deterministic code checks determine issue presence; generative AI explains and prioritizes issues rather than fabricating them.
- **Mobile Lighthouse Diagnostics:** Integrates Google PageSpeed Insights API (mobile strategy) to measure simulated Core Web Vitals (FCP, LCP, TBT, CLS).
- **Structured Data Signals:** Discovers schema.org entity types and detects JSON-LD parse errors.
- **Shareable, Expiring Reports:** Reports are protected by 192-bit cryptographic bearer tokens and expire automatically after 7 days.
- **Zero-Login & Privacy First:** No account or credit card required. Raw HTML, private cookies, and IP addresses are never stored.

---

## 2. Tech Stack

- **Framework:** Next.js 15 (App Router, Server Components & Route Handlers)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS with responsive layout & print stylesheet
- **HTML Parsing:** Cheerio (safe static parsing without script execution)
- **Robots Parser:** `robots-parser`
- **SSRF Defense:** `ipaddr.js` & custom DNS address validation
- **Database & Storage:** Supabase (PostgreSQL with RLS, advisory-locked quota RPC)
- **AI Engine:** Google Gemini API (`@google/genai`)
- **Performance Diagnostics:** Google PageSpeed Insights API v5
- **Test Suite:** Vitest

---

## 3. Project Structure

```text
crawlbrief-ai/
├── app/
│   ├── (marketing)/
│   │   ├── tools/crawlbrief-ai/page.tsx           # Product landing page & URL intake
│   │   ├── tools/crawlbrief-ai/how-it-works/page.tsx # Methodology, scope & limits
│   │   ├── privacy/page.tsx                       # Privacy notice & provider disclosures
│   │   └── terms/page.tsx                         # Terms & acceptable use policy
│   ├── report/[token]/page.tsx                    # Bearer-token protected report view
│   ├── api/
│   │   ├── audits/route.ts                        # POST audit orchestration endpoint
│   │   ├── reports/[token]/route.ts               # GET sanitized report endpoint
│   │   └── health/route.ts                        # Service health check
│   ├── layout.tsx
│   ├── page.tsx                                   # Root redirect to /tools/crawlbrief-ai
│   └── globals.css                                # Global design tokens & print styles
├── components/
│   ├── audit-url-form.tsx                         # Client URL input form & error handling
│   ├── audit-loading.tsx                          # Indeterminate audit progress indicator
│   ├── report-header.tsx                          # Report header, status, and action links
│   ├── score-panel.tsx                            # Overview metrics and category cards
│   ├── finding-card.tsx                           # Evidence-backed individual issue card
│   ├── performance-panel.tsx                      # Mobile Lighthouse lab scores & metrics
│   ├── schema-panel.tsx                           # JSON-LD entity & syntax inspection
│   ├── recommendation-list.tsx                    # Gemini prioritized action items
│   └── print-report-button.tsx                    # Native browser print / save as PDF
├── lib/
│   ├── env.ts                                     # Strongly-typed environment schema
│   ├── supabase/server.ts                         # Supabase service-role client & memory cache
│   ├── security/
│   │   ├── url-validation.ts                      # Normalization, port & protocol safeguards
│   │   ├── safe-fetch.ts                          # SSRF-safe HTTP fetch with IP pinning
│   │   ├── turnstile.ts                           # Cloudflare Turnstile token verification
│   │   └── rate-limit.ts                          # HMAC IP hashing & atomic daily quotas
│   ├── crawler/
│   │   ├── robots.ts                              # Robots.txt fetcher & rule evaluator
│   │   ├── discover.ts                            # Same-origin 5-page crawl scheduler
│   │   └── extract.ts                             # Cheerio page facts extractor
│   ├── audit/
│   │   ├── checks.ts                              # Deterministic SEO, schema, & heading checks
│   │   ├── findings.ts                            # Findings aggregator & ID generator
│   │   └── scoring.ts                             # Category scores & heuristic formula
│   ├── providers/
│   │   ├── gemini.ts                              # Gemini structured JSON recommendations
│   │   └── pagespeed.ts                           # Mobile PageSpeed Insights v5 client
│   ├── report/assemble.ts                         # End-to-end pipeline & token hashing
│   └── schemas/                                   # Zod schemas (input, output, reports)
├── supabase/
│   └── migrations/0001_initial_schema.sql         # Supabase PostgreSQL migration script
└── tests/                                         # Vitest test suite
    ├── url-validation.test.ts
    ├── safe-fetch.test.ts
    ├── robots.test.ts
    ├── checks.test.ts
    └── report-api.test.ts
```

---

## 4. Setup & Installation

### Prerequisites
- Node.js >= 18
- pnpm (recommended) or npm

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment Variables
Copy the example configuration:
```bash
cp .env.example .env.local
```

Fill in your provider keys in `.env.local`:
```ini
# Supabase Credentials (optional in local dev, uses in-memory store if unset)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Google Gemini API
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash

# Google PageSpeed Insights API
PAGESPEED_API_KEY=your-pagespeed-api-key

# Security & Limits
IP_HASH_SECRET=your-secure-random-secret-at-least-32-characters
DAILY_IP_AUDIT_LIMIT=2
DAILY_GLOBAL_AUDIT_LIMIT=50
REPORT_TTL_DAYS=7
```

### 3. Database Setup (Supabase)
Run the SQL migration in `supabase/migrations/0001_initial_schema.sql` inside your Supabase project's SQL Editor. This provisions:
- `public.audits`
- `public.audit_pages`
- `public.audit_findings`
- `public.rate_limits`
- `public.global_usage_daily`
- Row Level Security (RLS) policies
- The atomic `public.consume_audit_quota` PostgreSQL advisory lock function

### 4. Run Development Server
```bash
pnpm dev
```
Open `http://localhost:3000` in your browser.

---

## 5. Testing

Run the test suite covering SSRF defense, URL normalization, robots.txt compliance, deterministic checks, and report token hashing:

```bash
pnpm test
```

---

## 6. License & Credits

Built by Niket Chauhan. Released under the MIT License.
