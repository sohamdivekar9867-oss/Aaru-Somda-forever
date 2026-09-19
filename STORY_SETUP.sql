-- OUR STORY permissions and cleanup
-- Run this once in Supabase SQL Editor.

-- Remove the old placeholder chapter.
delete from public.story_pages
where lower(trim(title)) = 'how it began';

-- Normalize the two perspective owner labels so RLS can identify them.
update public.story_pages
set author = 'Aaru'
where lower(trim(author)) in ('rt', 'aaru')
   or lower(trim(slug)) in ('rt-perspective', 'aaru-perspective');

update public.story_pages
set author = 'Somda'
where lower(trim(author)) in ('soham', 'soham da', 'somda')
   or lower(trim(slug)) in ('soham-perspective', 'somda-perspective');

alter table public.story_pages enable row level security;

-- Remove any older story_pages policies so an old permissive policy cannot
-- accidentally override the new owner-specific rules.
do $$
declare
  policy_record record;
begin
  for policy_record in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'story_pages'
  loop
    execute format(
      'drop policy if exists %I on public.story_pages',
      policy_record.policyname
    );
  end loop;
end $$;

-- Both logged-in users may read the story.
create policy "story_pages_select_authenticated"
on public.story_pages
for select
to authenticated
using (auth.uid() is not null);

-- Either authorized account may create a new chapter pair.
-- Editing an existing perspective is still restricted below.
create policy "story_pages_insert_authenticated"
on public.story_pages
for insert
to authenticated
with check (
  lower(trim(coalesce(author, ''))) in ('aaru', 'somda')
  and lower(coalesce(auth.jwt() ->> 'email', '')) in (
    'aaru.saru090901@gmail.com',
    'sohamdivekar9867@gmail.com'
  )
);

-- Aaru can update only Aaru rows.
create policy "Aaru can update Aaru perspective"
on public.story_pages
for update
to authenticated
using (
  lower(trim(coalesce(author, ''))) = 'aaru'
  and lower(coalesce(auth.jwt() ->> 'email', '')) = 'aaru.saru090901@gmail.com'
)
with check (
  lower(trim(coalesce(author, ''))) = 'aaru'
  and lower(coalesce(auth.jwt() ->> 'email', '')) = 'aaru.saru090901@gmail.com'
);

-- Somda can update only Somda rows.
create policy "Somda can update Somda perspective"
on public.story_pages
for update
to authenticated
using (
  lower(trim(coalesce(author, ''))) = 'somda'
  and lower(coalesce(auth.jwt() ->> 'email', '')) = 'sohamdivekar9867@gmail.com'
)
with check (
  lower(trim(coalesce(author, ''))) = 'somda'
  and lower(coalesce(auth.jwt() ->> 'email', '')) = 'sohamdivekar9867@gmail.com'
);
