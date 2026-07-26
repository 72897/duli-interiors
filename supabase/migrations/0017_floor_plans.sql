-- ── 2D floor-plan geometry ───────────────────────────────────────────────
-- One editable plan per project, stored as a JSONB geometry blob (rooms as
-- polygons in FEET + door/window markers). Kept separate from the typed
-- `rooms`/`room_measurements` tables: those record what the customer tells us,
-- this records what they DRAW. Areas are derived on read, never trusted from
-- the client for anything binding.
create table if not exists public.floor_plans (
  project_id uuid primary key references public.projects(id) on delete cascade,
  data jsonb not null default '{"version":1,"rooms":[],"openings":[]}'::jsonb,
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.floor_plans enable row level security;

-- Anyone who can access the project can read AND edit its plan (customer
-- sketches their space; designer refines it). Same gate as the rest of the
-- workspace, so no new surface area.
drop policy if exists floor_plans_rw on public.floor_plans;
create policy floor_plans_rw on public.floor_plans
  for all
  using (public.can_access_project(project_id))
  with check (public.can_access_project(project_id));

revoke all on public.floor_plans from anon;
grant select, insert, update, delete on public.floor_plans to authenticated;
