-- Update trigger to build the full profile from signup metadata.
-- This way the frontend never needs to insert into profiles directly;
-- the trigger (security definer = runs as postgres) does it all.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  v_role    text    := 'director';
  v_approved boolean := false;
  meta      jsonb   := new.raw_user_meta_data;
begin
  if new.email = 'nestor.tarinda@gmail.com' then
    v_role    := 'admin';
    v_approved := true;
  end if;

  insert into public.profiles (
    id, nombre, telefono,
    bni_connect_email, bni_connect_password,
    chapter_id, role, aprobado
  ) values (
    new.id,
    coalesce(meta->>'nombre', ''),
    coalesce(meta->>'telefono', ''),
    coalesce(meta->>'bni_connect_email', new.email),
    coalesce(meta->>'bni_connect_password', ''),
    nullif(meta->>'chapter_id', '')::uuid,
    v_role,
    v_approved
  )
  on conflict (id) do update set
    nombre               = excluded.nombre,
    telefono             = excluded.telefono,
    bni_connect_email    = excluded.bni_connect_email,
    bni_connect_password = excluded.bni_connect_password,
    chapter_id           = excluded.chapter_id,
    role                 = excluded.role,
    aprobado             = excluded.aprobado;

  return new;
end;
$$;
