# Aaru & Somda — Shared Data Audit

This site is a shared two-person experience. Relationship content must be stored in Supabase, not browser-local storage.

## Shared Supabase data
- Our Story: `story_chapters`, `story_perspectives`, `story_chapter_delete_requests`
- Love Letters: `love_letters`
- Our Dates: `date_entries` + date photo storage
- Bucket List: `bucket_list`
- Date Cat planned quests: `planned_date_quests`

## Intentionally local
- `sessionStorage` in `auth.js` / `protect.js`: temporary login session only.
- UI state such as the current Date Cat conversation is local/temporary and is not relationship data.

## Rule for future features
If Aaru creates it and Somda should see it (or vice versa), store it in Supabase with appropriate RLS. Never use `localStorage` for shared relationship content.

## Setup
Run the SQL setup files included in this project in Supabase SQL Editor when required.
