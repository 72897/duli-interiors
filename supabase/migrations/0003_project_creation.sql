-- 0003_project_creation.sql — project code generation + atomic create RPC.

-- ── Auto-generate project code: CAL-<year>-NNNN ──────────────
create sequence if not exists public.project_code_seq;

create or replace function public.set_project_code()
returns trigger language plpgsql as $$
begin
  if new.code is null or new.code = '' then
    new.code := 'CAL-' || to_char(now(), 'YYYY') || '-' ||
                lpad(nextval('public.project_code_seq')::text, 4, '0');
  end if;
  return new;
end; $$;

drop trigger if exists t_projects_set_code on public.projects;
create trigger t_projects_set_code
  before insert on public.projects
  for each row execute function public.set_project_code();

-- ── Atomic project creation (project + property + rooms + log) ─
-- SECURITY INVOKER (default): RLS still applies, so a customer can only create
-- a project owned by themselves. Rooms arrive as a jsonb array of
-- { room_type, room_name }.
create or replace function public.create_project(
  p_name text,
  p_city text,
  p_budget_level budget_level,
  p_property jsonb,
  p_rooms jsonb
)
returns table (id uuid, code text)
language plpgsql
as $$
declare
  v_project_id uuid;
  v_code text;
  v_room jsonb;
  v_sort int := 0;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  insert into public.projects (name, customer_id, created_by, city, budget_level, status)
  values (coalesce(nullif(p_name, ''), 'Untitled project'), auth.uid(), auth.uid(),
          p_city, p_budget_level, 'submitted')
  returning projects.id, projects.code into v_project_id, v_code;

  insert into public.properties (project_id, property_type, city, address_line, pincode, total_area, area_unit, bhk)
  values (
    v_project_id,
    nullif(p_property->>'property_type','')::property_type,
    coalesce(p_property->>'city', p_city),
    p_property->>'address_line',
    p_property->>'pincode',
    nullif(p_property->>'total_area','')::numeric,
    coalesce(nullif(p_property->>'area_unit','')::area_unit, 'sqft'),
    p_property->>'bhk'
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
  values (v_project_id, auth.uid(), 'project.created',
          jsonb_build_object('room_count', jsonb_array_length(coalesce(p_rooms,'[]'::jsonb))));

  return query select v_project_id, v_code;
end; $$;
