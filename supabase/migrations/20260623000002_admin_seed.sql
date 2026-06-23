-- This migration sets nestor.tarinda@gmail.com as admin after they register.
-- It runs automatically; if the user hasn't registered yet it waits (no-op).
-- The actual promotion runs via a trigger on auth.users insert.

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  v_role text := 'director';
  v_approved boolean := false;
begin
  -- Auto-approve and elevate admin account
  if new.email = 'nestor.tarinda@gmail.com' then
    v_role := 'admin';
    v_approved := true;
  end if;

  -- Profile is created separately from the registration form.
  -- This trigger just ensures a minimal fallback row exists
  -- so FK constraints never break if the form fails mid-way.
  insert into public.profiles (id, nombre, telefono, bni_connect_email, bni_connect_password, role, aprobado)
  values (new.id, '', '', new.email, '', v_role, v_approved)
  on conflict (id) do update
    set role = excluded.role,
        aprobado = excluded.aprobado;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
