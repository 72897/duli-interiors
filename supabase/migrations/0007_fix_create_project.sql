-- 0007_fix_create_project.sql
--
-- Fixes: "new row violates row-level security policy for table \"projects\""
-- when creating a project through the wizard.
--
-- Why: create_project writes across four RLS-protected tables (projects,
-- properties, rooms, project_activity_logs) in one transaction. Running it as
-- SECURITY INVOKER made the insert depend on policy evaluation inside the
-- function, which is where it failed.
--
-- Safety: the function is SECURITY DEFINER but it *hard-codes*
-- customer_id := auth.uid() and refuses to run without a session — so a caller
-- can only ever create a project owned by themselves. It cannot be used to
-- write on behalf of another user. This is the standard Supabase pattern for a
-- trusted, audited write path.

create or replace function public.create_project(
  p_name text,
  p_city text,
  p_budget_level budget_level,
  p_property jsonb,
  p_rooms jsonb
)
returns table (id uuid, code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_project_id uuid;
  v_code text;
  v_room jsonb;
  v_sort int := 0;
begin
  -- No session → no project. This is the gate that makes SECURITY DEFINER safe.
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  -- Safety net: projects.customer_id references profiles(id). If the signup
  -- trigger never ran for this user, the insert would fail on the FK.
  insert into public.profiles (id)
  values (v_uid)
  on conflict (id) do nothing;

  insert into public.projects (name, customer_id, created_by, city, budget_level, status)
  values (
    coalesce(nullif(p_name, ''), 'Untitled project'),
    v_uid,          -- owner is always the caller
    v_uid,
    p_city,
    p_budget_level,
    'submitted'
  )
  returning projects.id, projects.code into v_project_id, v_code;

  insert into public.properties (project_id, property_type, city, address_line, pincode, total_area, area_unit, bhk)
  values (
    v_project_id,
    nullif(p_property->>'property_type','')::property_type,
    coalesce(nullif(p_property->>'city',''), p_city),
    nullif(p_property->>'address_line',''),
    nullif(p_property->>'pincode',''),
    nullif(p_property->>'total_area','')::numeric,
    coalesce(nullif(p_property->>'area_unit','')::area_unit, 'sqft'),
    nullif(p_property->>'bhk','')
  );

  for v_room in select * from jsonb_array_elements(coalesce(p_rooms, '[]'::jsonb))
  loop
    insert into public.rooms (project_id, room_type, room_name, sort_order)
    values (
      v_project_id,
      (v_room->>'room_type')::room_type,
      nullif(v_room->>'room_name',''),
      v_sort
    );
    v_sort := v_sort + 1;
  end loop;

  insert into public.project_activity_logs (project_id, actor_id, action, metadata)
  values (
    v_project_id,
    v_uid,
    'project.created',
    jsonb_build_object('room_count', jsonb_array_length(coalesce(p_rooms, '[]'::jsonb)))
  );

  return query select v_project_id, v_code;
end; $$;

-- Only signed-in users may call it (the function still enforces ownership).
revoke all on function public.create_project(text, text, budget_level, jsonb, jsonb) from public, anon;
grant execute on function public.create_project(text, text, budget_level, jsonb, jsonb) to authenticated;

-- Backfill: make sure every existing auth user has a profile row.
insert into public.profiles (id)
select u.id from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;
