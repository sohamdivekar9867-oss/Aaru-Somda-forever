-- OUR STORY: shared chapters + two private perspectives
-- Run this once in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.story_chapters (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  display_order integer not null default 0,
  published boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.story_perspectives (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.story_chapters(id) on delete cascade,
  author text not null check (author in ('Aaru','Somda')),
  content text not null default '',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (chapter_id, author)
);

create unique index if not exists story_chapters_title_lower_unique
on public.story_chapters (lower(title));

-- Migrate the existing story_pages data into the shared-chapter model.
-- "How It Began" is intentionally not migrated.
do $$
begin
  insert into public.story_chapters (title, display_order, published, created_at, updated_at)
  select min(trim(title)) as title,
         min(coalesce(display_order, 0)) as display_order,
         bool_or(coalesce(published, true)) as published,
         now() as created_at,
         now() as updated_at
  from public.story_pages
  where trim(coalesce(title, '')) <> ''
    and lower(trim(title)) <> 'how it began'
  group by lower(trim(title))
  on conflict (lower(title)) do nothing;
exception when undefined_table then
  null;
end $$;

do $$
begin
  insert into public.story_perspectives (chapter_id, author, content, created_at, updated_at)
  select c.id,
         case
           when lower(coalesce(sp.author,'') || ' ' || coalesce(sp.slug,'')) like '%soham%' then 'Somda'
           else 'Aaru'
         end as author,
         coalesce(sp.content, ''),
         now(),
         now()
  from public.story_pages sp
  join public.story_chapters c
    on lower(trim(c.title)) = lower(trim(sp.title))
  where lower(trim(coalesce(sp.title, ''))) <> 'how it began'
  on conflict (chapter_id, author) do update
    set content = excluded.content,
        updated_at = greatest(public.story_perspectives.updated_at, excluded.updated_at);
exception when undefined_table then
  null;
end $$;

-- Remove the old placeholder from the legacy table so it cannot appear in older code.
do $$
begin
  delete from public.story_pages where lower(trim(coalesce(title,''))) = 'how it began';
exception when undefined_table then
  null;
end $$;

alter table public.story_chapters enable row level security;
alter table public.story_perspectives enable row level security;

drop policy if exists "story chapters read" on public.story_chapters;
drop policy if exists "story chapters insert" on public.story_chapters;
drop policy if exists "story chapters update" on public.story_chapters;
drop policy if exists "story chapters delete" on public.story_chapters;

drop policy if exists "story perspectives read" on public.story_perspectives;
drop policy if exists "story perspectives insert" on public.story_perspectives;
drop policy if exists "story perspectives update" on public.story_perspectives;
drop policy if exists "story perspectives delete" on public.story_perspectives;

create policy "story chapters read"
on public.story_chapters for select
to authenticated
using (true);

create policy "story chapters insert"
on public.story_chapters for insert
to authenticated
with check (auth.uid() is not null);

-- Either Aaru or Somda may edit the shared chapter heading.
create policy "story chapters update"
on public.story_chapters for update
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "story chapters delete"
on public.story_chapters for delete
to authenticated
using (auth.uid() is not null);

create policy "story perspectives read"
on public.story_perspectives for select
to authenticated
using (true);

-- Aaru can create only Aaru rows; Somda can create only Somda rows.
create policy "story perspectives insert"
on public.story_perspectives for insert
to authenticated
with check (
  (lower(auth.jwt() ->> 'email') = 'aaru.saru090901@gmail.com' and author = 'Aaru')
  or
  (lower(auth.jwt() ->> 'email') = 'sohamdivekar9867@gmail.com' and author = 'Somda')
);

-- Each person can update only their own perspective.
create policy "story perspectives update"
on public.story_perspectives for update
to authenticated
using (
  (lower(auth.jwt() ->> 'email') = 'aaru.saru090901@gmail.com' and author = 'Aaru')
  or
  (lower(auth.jwt() ->> 'email') = 'sohamdivekar9867@gmail.com' and author = 'Somda')
)
with check (
  (lower(auth.jwt() ->> 'email') = 'aaru.saru090901@gmail.com' and author = 'Aaru')
  or
  (lower(auth.jwt() ->> 'email') = 'sohamdivekar9867@gmail.com' and author = 'Somda')
);

create policy "story perspectives delete"
on public.story_perspectives for delete
to authenticated
using (
  (lower(auth.jwt() ->> 'email') = 'aaru.saru090901@gmail.com' and author = 'Aaru')
  or
  (lower(auth.jwt() ->> 'email') = 'sohamdivekar9867@gmail.com' and author = 'Somda')
);
