-- AARU & SOMDA SHARED WORLD --
-- Run MASTER_SHARED_SETUP.sql once in Supabase SQL Editor.
-- All relationship content is shared through Supabase.
-- Only the two registered couple accounts are allowed to access shared data.

create extension if not exists pgcrypto;

create or replace function public.is_couple_member()
returns boolean
language sql
stable
security invoker
as $$
  select lower(coalesce(auth.jwt() ->> 'email','')) in (
    'aaru.saru090901@gmail.com',
    'sohamdivekar9867@gmail.com'
  );
$$;

-- SHARED BUCKET LIST
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
alter table public.bucket_list add column if not exists expected_date date;
alter table public.bucket_list add column if not exists completed boolean not null default false;
alter table public.bucket_list add column if not exists completion_date date;
alter table public.bucket_list add column if not exists display_order integer not null default 0;
alter table public.bucket_list add column if not exists created_at timestamptz not null default now();
alter table public.bucket_list add column if not exists updated_at timestamptz not null default now();
alter table public.bucket_list enable row level security;
drop policy if exists "Public bucket list reads" on public.bucket_list;
drop policy if exists "Public bucket list inserts" on public.bucket_list;
drop policy if exists "Public bucket list updates" on public.bucket_list;
drop policy if exists "Public bucket list deletes" on public.bucket_list;
drop policy if exists "Couple can view bucket list" on public.bucket_list;
drop policy if exists "Couple can add bucket list" on public.bucket_list;
drop policy if exists "Couple can update bucket list" on public.bucket_list;
drop policy if exists "Couple can delete bucket list" on public.bucket_list;
create policy "Couple can view bucket list" on public.bucket_list for select to authenticated using (public.is_couple_member());
create policy "Couple can add bucket list" on public.bucket_list for insert to authenticated with check (public.is_couple_member());
create policy "Couple can update bucket list" on public.bucket_list for update to authenticated using (public.is_couple_member()) with check (public.is_couple_member());
create policy "Couple can delete bucket list" on public.bucket_list for delete to authenticated using (public.is_couple_member());

