# Final setup

## 1. Supabase

Run **only** `MASTER_SHARED_SETUP.sql` in the Supabase SQL Editor.

The individual files are provided for reference/feature-specific reruns, but the master script is the intended setup for this final build.

The master script:
- creates/updates the shared tables
- creates the two-account access helper
- migrates the legacy Story data into the current Story structure when possible
- updates RLS policies
- configures Date Cat planned quests
- configures date photo storage permissions
- installs the two-person Story deletion functions

## 2. GitHub

Replace the website files with the files in this ZIP. Do not mix files from older Date Cat / Story ZIPs.

## 3. After deployment

Log in once as Aaru and once as Somda and test:
- add a Story chapter as either person
- edit each person's perspective
- create/delete-request a Story chapter
- add a Love Letter
- add a Bucket List item
- add a completed Date
- upload a Date photo
- create a Date Cat planned quest
- open Our Dates from the other account and verify the same planned quest appears

## 4. What is intentionally browser-local

Only login/session state and temporary UI state are browser-local. Relationship content is backend-shared.

- **Teddy / Important Dates** — configured by `MASTER_SHARED_SETUP.sql`; the setup seeds 27 August 2026 as the relationship start date used by the dynamic Days Together counter.
