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

-- LOVE LETTERS
create table if not exists public.love_letters (
  id uuid primary key default gen_random_uuid(),
  recipient text not null,
  content text not null,
  signature text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.love_letters add column if not exists recipient text;
alter table public.love_letters add column if not exists content text;
alter table public.love_letters add column if not exists signature text;
alter table public.love_letters add column if not exists display_order integer not null default 0;
alter table public.love_letters add column if not exists created_at timestamptz not null default now();
alter table public.love_letters add column if not exists updated_at timestamptz not null default now();
alter table public.love_letters enable row level security;
drop policy if exists "Authenticated users can view love letters" on public.love_letters;
drop policy if exists "Authenticated users can create love letters" on public.love_letters;
drop policy if exists "Authenticated users can update love letters" on public.love_letters;
drop policy if exists "Authenticated users can delete love letters" on public.love_letters;
drop policy if exists "Couple can view love letters" on public.love_letters;
drop policy if exists "Couple can create love letters" on public.love_letters;
drop policy if exists "Couple can update love letters" on public.love_letters;
drop policy if exists "Couple can delete love letters" on public.love_letters;
create policy "Couple can view love letters" on public.love_letters for select to authenticated using (public.is_couple_member());
create policy "Couple can create love letters" on public.love_letters for insert to authenticated with check (public.is_couple_member());
create policy "Couple can update love letters" on public.love_letters for update to authenticated using (public.is_couple_member()) with check (public.is_couple_member());
create policy "Couple can delete love letters" on public.love_letters for delete to authenticated using (public.is_couple_member());

