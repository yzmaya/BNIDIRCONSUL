-- Allow unauthenticated (anon) users to read chapters
-- Needed so the registration dropdown can populate before login
drop policy if exists "chapters_read" on public.chapters;

create policy "chapters_read" on public.chapters
  for select to anon, authenticated using (true);
