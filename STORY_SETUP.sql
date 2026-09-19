-- OUR STORY setup / permissions
-- Run once in Supabase SQL Editor.
-- This uses the authenticated Supabase email to protect each perspective.

alter table public.story_pages enable row level security;

-- Keep the story readable only to authenticated users.
drop policy if exists "Authenticated users can view story pages" on public.story_pages;
create policy "Authenticated users can view story pages"
on public.story_pages
for select
to authenticated
using (true);

-- Aaru may insert/update/delete Aaru rows; Somda may insert/update/delete Somda rows.
drop policy if exists "Aaru can manage Aaru story pages" on public.story_pages;
create policy "Aaru can manage Aaru story pages"
on public.story_pages
for all
to authenticated
using (
  lower(coalesce(auth.jwt() ->> 'email','')) = 'aaru.saru090901@gmail.com'
  and lower(coalesce(author,'')) = 'aaru'
)
with check (
  lower(coalesce(auth.jwt() ->> 'email','')) = 'aaru.saru090901@gmail.com'
  and lower(coalesce(author,'')) = 'aaru'
);

drop policy if exists "Somda can manage Somda story pages" on public.story_pages;
create policy "Somda can manage Somda story pages"
on public.story_pages
for all
to authenticated
using (
  lower(coalesce(auth.jwt() ->> 'email','')) = 'sohamdivekar9867@gmail.com'
  and lower(coalesce(author,'')) = 'somda'
)
with check (
  lower(coalesce(auth.jwt() ->> 'email','')) = 'sohamdivekar9867@gmail.com'
  and lower(coalesce(author,'')) = 'somda'
);

-- Remove the old placeholder chapter.
delete from public.story_pages
where lower(trim(coalesce(title,''))) = 'how it began';
