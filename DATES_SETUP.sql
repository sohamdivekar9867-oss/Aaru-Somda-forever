-- Run this entire script once in Supabase SQL Editor.

create table if not exists public.date_entries (
  id uuid primary key default gen_random_uuid(),
  location text not null,
  occasion text,
  date date not null,
  description text,
  detail text,
  favourite_moment text,
  photo_urls jsonb not null default '[]'::jsonb,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.date_entries enable row level security;

drop policy if exists "Public can view date entries" on public.date_entries;
drop policy if exists "Public can add date entries" on public.date_entries;
drop policy if exists "Public can update date entries" on public.date_entries;
drop policy if exists "Public can delete date entries" on public.date_entries;

create policy "Public can view date entries"
on public.date_entries for select to anon using (true);

create policy "Public can add date entries"
on public.date_entries for insert to anon with check (true);

create policy "Public can update date entries"
on public.date_entries for update to anon using (true) with check (true);

create policy "Public can delete date entries"
on public.date_entries for delete to anon using (true);

-- Create the public storage bucket for date photos.
insert into storage.buckets (id, name, public)
values ('date-photos', 'date-photos', true)
on conflict (id) do update set public = true;

-- Storage policies for uploading and viewing date photos.
drop policy if exists "Public can upload date photos" on storage.objects;
drop policy if exists "Public can view date photos" on storage.objects;
drop policy if exists "Public can delete date photos" on storage.objects;

create policy "Public can upload date photos"
on storage.objects for insert to anon
with check (bucket_id = 'date-photos');

create policy "Public can view date photos"
on storage.objects for select to anon
using (bucket_id = 'date-photos');

create policy "Public can delete date photos"
on storage.objects for delete to anon
using (bucket_id = 'date-photos');
