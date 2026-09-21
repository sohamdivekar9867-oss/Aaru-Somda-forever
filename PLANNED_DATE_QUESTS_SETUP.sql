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

-- DATE CAT PLANNED QUESTS
create table if not exists public.planned_date_quests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  location text,
  activity text,
  duration text,
  budget text,
  romance integer not null default 3,
  objectives jsonb not null default '[]'::jsonb,
  note text,
  date date not null,
  status text not null default 'planned',
  created_at timestamptz not null default now()
);
alter table public.planned_date_quests add column if not exists location text;
alter table public.planned_date_quests add column if not exists activity text;
alter table public.planned_date_quests add column if not exists duration text;
alter table public.planned_date_quests add column if not exists budget text;
alter table public.planned_date_quests add column if not exists romance integer not null default 3;
alter table public.planned_date_quests add column if not exists objectives jsonb not null default '[]'::jsonb;
alter table public.planned_date_quests add column if not exists note text;
alter table public.planned_date_quests add column if not exists date date;
alter table public.planned_date_quests add column if not exists status text not null default 'planned';
alter table public.planned_date_quests add column if not exists created_at timestamptz not null default now();
alter table public.planned_date_quests enable row level security;
drop policy if exists "Public can view planned date quests" on public.planned_date_quests;
drop policy if exists "Public can add planned date quests" on public.planned_date_quests;
drop policy if exists "Public can update planned date quests" on public.planned_date_quests;
drop policy if exists "Public can delete planned date quests" on public.planned_date_quests;
drop policy if exists "Couple can view planned date quests" on public.planned_date_quests;
drop policy if exists "Couple can add planned date quests" on public.planned_date_quests;
drop policy if exists "Couple can update planned date quests" on public.planned_date_quests;
drop policy if exists "Couple can delete planned date quests" on public.planned_date_quests;
create policy "Couple can view planned date quests" on public.planned_date_quests for select to authenticated using (public.is_couple_member());
create policy "Couple can add planned date quests" on public.planned_date_quests for insert to authenticated with check (public.is_couple_member());
create policy "Couple can update planned date quests" on public.planned_date_quests for update to authenticated using (public.is_couple_member()) with check (public.is_couple_member());
create policy "Couple can delete planned date quests" on public.planned_date_quests for delete to authenticated using (public.is_couple_member());

