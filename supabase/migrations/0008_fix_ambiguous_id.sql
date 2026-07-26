-- 0008_fix_ambiguous_id.sql
--
-- Fixes: "column reference \"id\" is ambiguous" when creating a project.
--
-- Cause: `RETURNS TABLE (id uuid, code text)` makes plpgsql declare implicit
-- OUT variables named `id` and `code`. Inside the body, any unqualified `id`
-- (e.g. `insert into public.profiles (id) ... on conflict (id)`, added in 0007)
-- is then ambiguous between that variable and the column.
--
-- Fix: name the OUT columns so they cannot collide with any column, and
-- fully qualify the RETURNING targets. Callers read project_id / project_code.

-- CREATE OR REPLACE cannot change a function's return type, and we're changing
-- the OUT columns from (id, code) to (project_id, project_code) — so the old
-- signature must be dropped first. Safe: it's recreated immediately below in
-- the same transaction.
drop function if exists public.create_project(text, text, budget_level, jsonb, jsonb);

create function public.create_project(
  p_name text,
  p_city text,
  p_budget_level budget_level,
  p_property jsonb,
  p_rooms jsonb
)
returns table (project_id uuid, project_code text)
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
  -- No session → no project. This gate is what makes SECURITY DEFINER safe.
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  -- projects.customer_id references profiles(id); make sure the row exists.
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
  returning public.projects.id, public.projects.code
  into v_project_id, v_code;

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

-- Only signed-in users may invoke it (the body still enforces ownership).
revoke all on function public.create_project(text, text, budget_level, jsonb, jsonb) from public, anon;
grant execute on function public.create_project(text, text, budget_level, jsonb, jsonb) to authenticated;
