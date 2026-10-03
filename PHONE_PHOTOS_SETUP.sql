-- PHONE_PHOTOS_SETUP.sql
-- Shared private chat-photo gallery for Aaru and Somo.
-- Run once in Supabase SQL Editor. This does NOT touch love_letters.

create or replace function public.current_couple_profile()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select case lower(coalesce(auth.jwt() ->> 'email', ''))
    when 'aaru.saru090901@gmail.com' then 'Aaru'
    when 'sohamdivekar9867@gmail.com' then 'Somo'
    else null
  end;
$$;

revoke all on function public.current_couple_profile() from public;
grant execute on function public.current_couple_profile() to authenticated;

create table if not exists public.chat_photos (
  id uuid primary key default gen_random_uuid(),
  profile_name text not null check (profile_name in ('Aaru', 'Somo')),
  storage_path text not null unique,
  original_name text,
  mime_type text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.chat_photos enable row level security;

drop policy if exists "Chat photos are visible to the couple" on public.chat_photos;
drop policy if exists "Chat photos can be added to own profile" on public.chat_photos;
drop policy if exists "Chat photos can be deleted by uploader" on public.chat_photos;

create policy "Chat photos are visible to the couple"
on public.chat_photos
for select
to authenticated
using (public.is_couple_member());

create policy "Chat photos can be added to own profile"
on public.chat_photos
for insert
to authenticated
with check (
  public.is_couple_member()
  and created_by = auth.uid()
  and profile_name = public.current_couple_profile()
);

create policy "Chat photos can be deleted by uploader"
on public.chat_photos
for delete
to authenticated
using (
  public.is_couple_member()
  and created_by = auth.uid()
);

insert into storage.buckets (id, name, public)
values ('chat-photos', 'chat-photos', false)
on conflict (id) do update set public = false;

drop policy if exists "Chat photos storage read" on storage.objects;
drop policy if exists "Chat photos storage upload own profile" on storage.objects;
drop policy if exists "Chat photos storage delete own files" on storage.objects;

create policy "Chat photos storage read"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'chat-photos'
  and public.is_couple_member()
);

create policy "Chat photos storage upload own profile"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'chat-photos'
  and public.is_couple_member()
  and (storage.foldername(name))[1] = public.current_couple_profile()
  and (storage.foldername(name))[2] = auth.uid()::text
);

create policy "Chat photos storage delete own files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'chat-photos'
  and public.is_couple_member()
  and (storage.foldername(name))[2] = auth.uid()::text
);
