-- Run this once in the Supabase SQL Editor.
-- This makes Date Cat planned dates shared between Aaru and Somda.

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

alter table public.planned_date_quests enable row level security;

drop policy if exists "Public can view planned date quests" on public.planned_date_quests;
drop policy if exists "Public can add planned date quests" on public.planned_date_quests;
drop policy if exists "Public can update planned date quests" on public.planned_date_quests;
drop policy if exists "Public can delete planned date quests" on public.planned_date_quests;

create policy "Public can view planned date quests"
on public.planned_date_quests for select to anon using (true);

create policy "Public can add planned date quests"
on public.planned_date_quests for insert to anon with check (true);

create policy "Public can update planned date quests"
on public.planned_date_quests for update to anon using (true) with check (true);

create policy "Public can delete planned date quests"
on public.planned_date_quests for delete to anon using (true);
