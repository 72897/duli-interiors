-- 0012_signup_role_onboarding.sql
--
-- Extends signup so a new user can pick a role and give profile details up
-- front. The trigger runs as the DB (security definer), so it can read the
-- metadata the signup form put on auth.users and set everything atomically —
-- no client session needed at signup time.
--
-- SECURITY: self-serve roles are ONLY 'designer', 'vendor', 'contractor'
-- (plus 'customer', always granted). A signup can NEVER self-assign
-- admin/super_admin/sales/project_manager — those are granted by an admin.
-- RLS still scopes all data, so a self-declared designer/vendor sees nothing
-- they aren't a member of.

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  requested text := new.raw_user_meta_data->>'requested_role';
begin
  insert into public.profiles (id, full_name, phone, city)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    nullif(new.raw_user_meta_data->>'phone', ''),
    nullif(new.raw_user_meta_data->>'city', '')
  );

  -- Everyone is a customer.
  insert into public.profile_roles (profile_id, role_id)
  select new.id, r.id from public.roles r where r.key = 'customer'
  on conflict do nothing;

  -- Plus one self-serve professional role, if a valid one was requested.
  if requested in ('designer', 'vendor', 'contractor') then
    insert into public.profile_roles (profile_id, role_id)
    select new.id, r.id from public.roles r where r.key = requested
    on conflict do nothing;
  end if;

  return new;
end; $$;
