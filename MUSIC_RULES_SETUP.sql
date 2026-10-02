-- ============================================================
-- OUR MUSIC + TO DO / NOT TO DO
-- Run this once in Supabase SQL Editor after the existing setup.
-- ============================================================

create table if not exists public.couple_music (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  youtube_url text not null,
  added_by text not null check (added_by in ('Aaru','Somda')),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.couple_music enable row level security;

drop policy if exists "Couple music read" on public.couple_music;
drop policy if exists "Couple music insert" on public.couple_music;
drop policy if exists "Couple music update own" on public.couple_music;
drop policy if exists "Couple music delete own" on public.couple_music;

create policy "Couple music read" on public.couple_music
for select to authenticated
using (public.is_couple_member());

create policy "Couple music insert" on public.couple_music
for insert to authenticated
with check (
  public.is_couple_member()
  and created_by = auth.uid()
  and (
    (lower(auth.jwt() ->> 'email') = 'aaru.saru090901@gmail.com' and added_by = 'Aaru')
    or
    (lower(auth.jwt() ->> 'email') = 'sohamdivekar9867@gmail.com' and added_by = 'Somda')
  )
);

create policy "Couple music update own" on public.couple_music
for update to authenticated
using (public.is_couple_member() and created_by = auth.uid())
with check (public.is_couple_member() and created_by = auth.uid());

create policy "Couple music delete own" on public.couple_music
for delete to authenticated
using (public.is_couple_member() and created_by = auth.uid());

-- ============================================================
-- TO DO / NOT TO DO
-- target = the person the reminder is FOR.
-- Only the other person can create a reminder for that target.
-- Each person can edit/delete only reminders they created.
-- ============================================================

create table if not exists public.couple_rules (
  id uuid primary key default gen_random_uuid(),
  target text not null check (target in ('Aaru','Somda')),
  kind text not null check (kind in ('to_do','not_do')),
  text text not null,
  added_by text not null check (added_by in ('Aaru','Somda')),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.couple_rules enable row level security;

drop policy if exists "Couple rules read" on public.couple_rules;
drop policy if exists "Couple rules insert" on public.couple_rules;
drop policy if exists "Couple rules update own" on public.couple_rules;
drop policy if exists "Couple rules delete own" on public.couple_rules;

create policy "Couple rules read" on public.couple_rules
for select to authenticated
using (public.is_couple_member());

create policy "Couple rules insert" on public.couple_rules
for insert to authenticated
with check (
  public.is_couple_member()
  and created_by = auth.uid()
  and (
    (lower(auth.jwt() ->> 'email') = 'aaru.saru090901@gmail.com' and added_by = 'Aaru' and target = 'Somda')
    or
    (lower(auth.jwt() ->> 'email') = 'sohamdivekar9867@gmail.com' and added_by = 'Somda' and target = 'Aaru')
  )
);

create policy "Couple rules update own" on public.couple_rules
for update to authenticated
using (public.is_couple_member() and created_by = auth.uid())
with check (public.is_couple_member() and created_by = auth.uid());

create policy "Couple rules delete own" on public.couple_rules
for delete to authenticated
using (public.is_couple_member() and created_by = auth.uid());
