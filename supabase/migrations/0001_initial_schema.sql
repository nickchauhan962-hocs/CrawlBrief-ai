-- CrawlBrief AI initial Supabase schema and quota function
-- Review/test in a development project before production.

create extension if not exists pgcrypto;

create table if not exists public.audits (
  id uuid primary key default gen_random_uuid(),
  public_token_hash text not null unique,
  submitted_url text not null,
  normalized_url text not null,
  host text not null,
  status text not null check (status in ('completed', 'partial', 'failed')),
  summary jsonb not null default '{}'::jsonb,
  category_scores jsonb not null default '{}'::jsonb,
  provider_status jsonb not null default '{}'::jsonb,
  crawl_metadata jsonb not null default '{}'::jsonb,
  error_code text,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  expires_at timestamptz not null default (now() + interval '7 days')
);

create index if not exists audits_expires_at_idx on public.audits (expires_at);
create index if not exists audits_host_created_at_idx on public.audits (host, created_at desc);

create table if not exists public.audit_pages (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references public.audits(id) on delete cascade,
  url text not null,
  http_status integer,
  content_type text,
  title text,
  meta_description text,
  h1_texts jsonb not null default '[]'::jsonb,
  heading_outline jsonb not null default '[]'::jsonb,
  canonical_url text,
  robots_directives text[] not null default '{}',
  html_lang text,
  has_viewport boolean,
  word_count integer,
  image_count integer,
  images_without_alt integer,
  internal_link_count integer,
  external_link_count integer,
  jsonld_types text[] not null default '{}',
  jsonld_parse_errors text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists audit_pages_audit_id_idx on public.audit_pages (audit_id);

create table if not exists public.audit_findings (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references public.audits(id) on delete cascade,
  page_id uuid references public.audit_pages(id) on delete cascade,
  check_key text not null,
  category text not null check (category in ('technical', 'performance', 'schema', 'content', 'ai_opportunity')),
  severity text not null check (severity in ('high', 'medium', 'low', 'info')),
  title text not null,
  description text not null,
  evidence jsonb not null default '{}'::jsonb,
  recommendation text,
  is_ai_generated boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists audit_findings_audit_id_idx on public.audit_findings (audit_id);

create table if not exists public.rate_limits (
  fingerprint_hash text not null,
  window_date date not null,
  request_count integer not null default 0 check (request_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (fingerprint_hash, window_date)
);

create table if not exists public.global_usage_daily (
  usage_date date primary key,
  audit_count integer not null default 0 check (audit_count >= 0),
  updated_at timestamptz not null default now()
);

-- All tables are accessed through trusted server code only.
-- RLS is enabled and direct browser roles receive no table privileges.
alter table public.audits enable row level security;
alter table public.audit_pages enable row level security;
alter table public.audit_findings enable row level security;
alter table public.rate_limits enable row level security;
alter table public.global_usage_daily enable row level security;

revoke all on public.audits from public, anon, authenticated;
revoke all on public.audit_pages from public, anon, authenticated;
revoke all on public.audit_findings from public, anon, authenticated;
revoke all on public.rate_limits from public, anon, authenticated;
revoke all on public.global_usage_daily from public, anon, authenticated;

create or replace function public.consume_audit_quota(
  p_fingerprint_hash text,
  p_daily_ip_limit integer,
  p_daily_global_limit integer
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_today date := (clock_timestamp() at time zone 'UTC')::date;
  v_ip_count integer;
  v_global_count integer;
begin
  if p_fingerprint_hash is null or length(p_fingerprint_hash) < 32 then
    raise exception 'invalid fingerprint';
  end if;
  if p_daily_ip_limit < 1 or p_daily_global_limit < 1 then
    raise exception 'limits must be positive';
  end if;

  -- Serialize requests for the same IP/day and the global counter/day.
  perform pg_advisory_xact_lock(
    hashtextextended('crawlbrief-ip-' || p_fingerprint_hash || '-' || v_today::text, 0)
  );
  perform pg_advisory_xact_lock(
    hashtextextended('crawlbrief-global-' || v_today::text, 0)
  );

  select request_count into v_ip_count
  from public.rate_limits
  where fingerprint_hash = p_fingerprint_hash and window_date = v_today
  for update;

  select audit_count into v_global_count
  from public.global_usage_daily
  where usage_date = v_today
  for update;

  if coalesce(v_ip_count, 0) >= p_daily_ip_limit then
    return false;
  end if;
  if coalesce(v_global_count, 0) >= p_daily_global_limit then
    return false;
  end if;

  insert into public.rate_limits (fingerprint_hash, window_date, request_count, updated_at)
  values (p_fingerprint_hash, v_today, 1, now())
  on conflict (fingerprint_hash, window_date)
  do update set request_count = public.rate_limits.request_count + 1,
                updated_at = now();

  insert into public.global_usage_daily (usage_date, audit_count, updated_at)
  values (v_today, 1, now())
  on conflict (usage_date)
  do update set audit_count = public.global_usage_daily.audit_count + 1,
                updated_at = now();

  return true;
end;
$$;

revoke all on function public.consume_audit_quota(text, integer, integer) from public;
revoke all on function public.consume_audit_quota(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_audit_quota(text, integer, integer) to service_role;
