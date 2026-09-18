-- Run this once in Supabase SQL Editor.
alter table public.love_letters enable row level security;

drop policy if exists "Authenticated users can view love letters" on public.love_letters;
drop policy if exists "Authenticated users can create love letters" on public.love_letters;
drop policy if exists "Authenticated users can update love letters" on public.love_letters;
drop policy if exists "Authenticated users can delete love letters" on public.love_letters;

create policy "Authenticated users can view love letters"
on public.love_letters for select to authenticated using (true);

create policy "Authenticated users can create love letters"
on public.love_letters for insert to authenticated
with check (auth.uid() is not null);

create policy "Authenticated users can update love letters"
on public.love_letters for update to authenticated
using (auth.uid() is not null) with check (auth.uid() is not null);

create policy "Authenticated users can delete love letters"
on public.love_letters for delete to authenticated
using (auth.uid() is not null);
