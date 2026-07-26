-- 0010_estimates_consultations_comments.sql
--
-- Project-scoped collaboration data: estimates (+ line items), consultations,
-- and comments. All gated by public.can_access_project() so a customer sees
-- only their own, staff see across projects they're on.
--
-- No seed: these are per-project/per-user, and the app already falls back to
-- mock demo data when a table is empty (so the studio still looks alive on a
-- fresh account). Rows appear here as real projects generate them.
--
-- Text columns (not enums) for the same reason as 0009: the app's TS unions are
-- the source of truth and don't line up with the existing DB enums.

-- ── Estimates ──────────────────────────────────────────────────────────────
create table public.estimates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  status text not null default 'draft',   -- draft|sent|approved|revision_requested|expired
  subtotal int not null default 0,
  tax int not null default 0,             -- GST placeholder, not a tax engine
  discount int not null default 0,
  total int not null default 0,
  currency text not null default 'INR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.estimate_items (
  id uuid primary key default gen_random_uuid(),
  estimate_id uuid not null references public.estimates(id) on delete cascade,
  room_id uuid references public.rooms(id) on delete set null,
  room_name text,
  category text not null,
  description text not null,
  quantity numeric not null default 1,
  unit text not null default 'no',
  unit_rate int not null default 0,
  amount int not null default 0,
  sort_order int not null default 0
);

create index idx_estimates_project on public.estimates(project_id);
create index idx_estimate_items_estimate on public.estimate_items(estimate_id);

create trigger t_estimates_updated before update on public.estimates
  for each row execute function public.set_updated_at();

alter table public.estimates enable row level security;
alter table public.estimate_items enable row level security;

create policy estimates_rw on public.estimates
  for all using (public.can_access_project(project_id))
  with check (public.can_access_project(project_id));

-- Line items inherit their estimate's project scope.
create policy estimate_items_rw on public.estimate_items
  for all using (
    exists (
      select 1 from public.estimates e
      where e.id = estimate_id and public.can_access_project(e.project_id)
    )
  )
  with check (
    exists (
      select 1 from public.estimates e
      where e.id = estimate_id and public.can_access_project(e.project_id)
    )
  );

-- ── Consultations ──────────────────────────────────────────────────────────
create table public.consultations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  designer_name text,
  city text not null,
  scheduled_at timestamptz not null,
  status text not null default 'requested', -- requested|scheduled|completed|cancelled
  mode text not null default 'call',        -- call|video|site_visit
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_consultations_user on public.consultations(user_id);
create index idx_consultations_project on public.consultations(project_id);

create trigger t_consultations_updated before update on public.consultations
  for each row execute function public.set_updated_at();

alter table public.consultations enable row level security;

-- Yours if it's your row, or you can access its project, or you're staff.
create policy consultations_select on public.consultations
  for select using (
    user_id = auth.uid()
    or (project_id is not null and public.can_access_project(project_id))
    or public.has_role(array['designer','sales','project_manager','admin','super_admin'])
  );

create policy consultations_insert on public.consultations
  for insert with check (user_id = auth.uid() or public.has_role(array['sales','project_manager','admin','super_admin']));

create policy consultations_update_staff on public.consultations
  for update using (public.has_role(array['designer','sales','project_manager','admin','super_admin']))
  with check (public.has_role(array['designer','sales','project_manager','admin','super_admin']));

-- ── Comments ───────────────────────────────────────────────────────────────
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  author_name text not null,
  author_role text not null default 'customer',
  visibility text not null default 'public', -- public|internal
  body text not null,
  target_type text,
  target_id text,
  created_at timestamptz not null default now()
);

create index idx_comments_project on public.comments(project_id);

alter table public.comments enable row level security;

-- Must be able to access the project. Internal notes are staff-only — a
-- customer never sees them even on their own project.
create policy comments_select on public.comments
  for select using (
    public.can_access_project(project_id)
    and (
      visibility = 'public'
      or public.has_role(array['designer','sales','project_manager','admin','super_admin'])
    )
  );

create policy comments_insert on public.comments
  for insert with check (public.can_access_project(project_id) and author_id = auth.uid());
