-- Run this once in Supabase SQL Editor

create table if not exists public.bucket_list (
  id uuid primary key default gen_random_uuid(),
  item text not null,
  expected_date date,
  completed boolean not null default false,
  completion_date date,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bucket_list enable row level security;

drop policy if exists "Public bucket list reads" on public.bucket_list;
drop policy if exists "Public bucket list inserts" on public.bucket_list;
drop policy if exists "Public bucket list updates" on public.bucket_list;
drop policy if exists "Public bucket list deletes" on public.bucket_list;

create policy "Public bucket list reads"
on public.bucket_list for select to anon
using (true);

create policy "Public bucket list inserts"
on public.bucket_list for insert to anon
with check (true);

create policy "Public bucket list updates"
on public.bucket_list for update to anon
using (true)
with check (true);

create policy "Public bucket list deletes"
on public.bucket_list for delete to anon
using (true);
