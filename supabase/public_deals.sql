-- Public verified deals feed. Run in Supabase SQL Editor.
create table if not exists public.public_deals (
 id uuid primary key default gen_random_uuid(),
 title text not null check (char_length(title) between 3 and 180),
 model text not null check (char_length(model) between 2 and 120),
 category text not null default 'Смартфони',
 source text not null,
 source_url text not null check (source_url ~ '^https://'),
 asking_price numeric(12,2) not null check (asking_price > 0),
 reference_price numeric(12,2) not null check (reference_price > 0),
 estimated_costs numeric(12,2) not null default 0 check (estimated_costs >= 0),
 condition text not null default 'Б/в',
 note text not null default '',
 observed_at timestamptz not null default now(),
 expires_at timestamptz not null default (now() + interval '48 hours'),
 published boolean not null default false,
 created_at timestamptz not null default now(),
 constraint valid_deal_dates check (expires_at > observed_at)
);
create index if not exists public_deals_live_idx on public.public_deals (published, expires_at desc, observed_at desc);
alter table public.public_deals enable row level security;
revoke all on public.public_deals from anon, authenticated;
grant select on public.public_deals to anon, authenticated;
drop policy if exists "Public can view current approved deals" on public.public_deals;
create policy "Public can view current approved deals" on public.public_deals for select to anon, authenticated
using (published = true and expires_at > now());
-- No insert/update/delete grants or policies for public roles.
-- Publish via trusted Supabase SQL Editor or secure server-side admin tools only.
-- Never paste secret keys into frontend code.
