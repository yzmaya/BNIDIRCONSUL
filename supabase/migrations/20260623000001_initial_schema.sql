-- Enable pgcrypto for password encryption
create extension if not exists pgcrypto;

-- ─────────────────────────────────────────
-- CHAPTERS
-- ─────────────────────────────────────────
create table public.chapters (
  id           uuid primary key default gen_random_uuid(),
  nombre       text not null,
  ciudad       text,
  region       text,
  dia_reunion  text,  -- 'lunes','martes','miercoles','jueves','viernes'
  activo       boolean not null default true,
  created_at   timestamptz not null default now()
);

alter table public.chapters enable row level security;

-- Everyone authenticated can read chapters (for the registration dropdown)
create policy "chapters_read" on public.chapters
  for select to authenticated using (true);

-- Only admin can insert/update/delete chapters
create policy "chapters_admin_write" on public.chapters
  for all to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ─────────────────────────────────────────
-- PROFILES (extends auth.users)
-- ─────────────────────────────────────────
create table public.profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  nombre                text not null,
  telefono              text not null,
  bni_connect_email     text not null,
  bni_connect_password  text not null,  -- stored encrypted via pgcrypto
  chapter_id            uuid references public.chapters(id),
  role                  text not null default 'director'
                          check (role in ('director', 'admin')),
  aprobado              boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Users can read and update their own profile
create policy "profiles_own_read" on public.profiles
  for select to authenticated using (id = auth.uid());

create policy "profiles_own_update" on public.profiles
  for update to authenticated using (id = auth.uid());

-- Admin can read and update all profiles
create policy "profiles_admin_all" on public.profiles
  for all to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Allow insert on registration (before profile exists)
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (id = auth.uid());

-- Trigger to update updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- ─────────────────────────────────────────
-- PALMS REPORTS
-- ─────────────────────────────────────────
create table public.palms_reports (
  id           uuid primary key default gen_random_uuid(),
  chapter_id   uuid not null references public.chapters(id),
  periodo_de   date,
  periodo_a    date,
  reuniones    integer not null default 1,
  uploaded_by  uuid references auth.users(id),
  source       text not null default 'manual' check (source in ('manual', 'scraping')),
  created_at   timestamptz not null default now()
);

alter table public.palms_reports enable row level security;

-- Directors see only reports from their own chapter
create policy "reports_director_read" on public.palms_reports
  for select to authenticated
  using (
    chapter_id = (
      select chapter_id from public.profiles where id = auth.uid()
    )
  );

create policy "reports_director_insert" on public.palms_reports
  for insert to authenticated
  with check (
    chapter_id = (
      select chapter_id from public.profiles where id = auth.uid()
    )
    and exists (
      select 1 from public.profiles where id = auth.uid() and aprobado = true
    )
  );

-- Admin sees everything
create policy "reports_admin_all" on public.palms_reports
  for all to authenticated
  using (
    exists (
      select 1 from public.profiles where id = auth.uid() and role = 'admin'
    )
  );

-- ─────────────────────────────────────────
-- PALMS MEMBERS (rows inside a report)
-- ─────────────────────────────────────────
create table public.palms_members (
  id          uuid primary key default gen_random_uuid(),
  report_id   uuid not null references public.palms_reports(id) on delete cascade,
  nombre      text,
  apellido    text,
  p           integer not null default 0,
  a           integer not null default 0,
  l           integer not null default 0,
  m           integer not null default 0,
  s           integer not null default 0,
  rdi         integer not null default 0,
  rde         integer not null default 0,
  rri         integer not null default 0,
  rre         integer not null default 0,
  v           integer not null default 0,
  uno_a_uno   integer not null default 0,
  gpnc        numeric not null default 0,
  ude         integer not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.palms_members enable row level security;

-- Members visible if the parent report is visible to the user
create policy "members_read_via_report" on public.palms_members
  for select to authenticated
  using (
    exists (
      select 1 from public.palms_reports r
      join public.profiles pr on pr.id = auth.uid()
      where r.id = report_id
        and (r.chapter_id = pr.chapter_id or pr.role = 'admin')
    )
  );

create policy "members_insert_via_report" on public.palms_members
  for insert to authenticated
  with check (
    exists (
      select 1 from public.palms_reports r
      join public.profiles pr on pr.id = auth.uid()
      where r.id = report_id
        and r.chapter_id = pr.chapter_id
        and pr.aprobado = true
    )
  );

create policy "members_admin_all" on public.palms_members
  for all to authenticated
  using (
    exists (
      select 1 from public.profiles where id = auth.uid() and role = 'admin'
    )
  );

-- ─────────────────────────────────────────
-- HELPER FUNCTION: is_admin()
-- ─────────────────────────────────────────
create or replace function public.is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;
