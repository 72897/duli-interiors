-- 0001_init.sql — Calyco Interiors Phase 0 foundation
-- Enums, helper functions, core tables, triggers, and RLS policies.
-- Forward-only. Apply to a fresh Supabase database.

-- ── Extensions ───────────────────────────────────────────────
create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ── Enums ────────────────────────────────────────────────────
create type contact_method as enum ('email', 'phone', 'whatsapp');
create type property_type as enum ('apartment','villa','independent_house','office','retail','other');
create type lead_status as enum ('new','contacted','qualified','not_qualified','consultation_booked','converted_to_project','lost');
create type project_status as enum ('draft','submitted','in_review','concepts_ready','revision_requested','approved','proposal_sent','accepted','closed','lost');
create type budget_level as enum ('essential','premium','luxury','custom');
create type project_member_role as enum ('designer','sales','project_manager','admin');
create type area_unit as enum ('sqft','sqm');
create type room_type as enum ('living_room','bedroom','kitchen','dining','bathroom','balcony','home_office','pooja_room','kids_room','wardrobe','other');
create type measurement_unit as enum ('ft','m','in','cm');
create type measurement_status as enum ('not_provided','customer_provided','designer_review_pending','confirmed','site_measurement_required');
create type upload_bucket as enum ('room-photos','floor-plans','reference-images','project-documents','ai-concepts','proposals');

-- ── Shared trigger: maintain updated_at ──────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

-- ── profiles / roles ─────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  city text,
  preferred_contact_method contact_method default 'email',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  label text not null
);

create table public.profile_roles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (profile_id, role_id)
);

-- Auto-create a profile on signup; new users get the 'customer' role.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  insert into public.profile_roles (profile_id, role_id)
  select new.id, r.id from public.roles r where r.key = 'customer';
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Authorization helper functions ───────────────────────────
create or replace function public.has_role(role_keys text[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profile_roles pr
    join public.roles r on r.id = pr.role_id
    where pr.profile_id = auth.uid() and r.key = any(role_keys)
  );
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(array['admin','super_admin']);
$$;

-- ── leads ────────────────────────────────────────────────────
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  phone text,
  city text,
  property_type property_type,
  service_type text,
  estimated_budget numeric,
  preferred_contact_method contact_method,
  source text,
  status lead_status not null default 'new',
  assigned_sales_user uuid references public.profiles(id),
  next_follow_up_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── projects ─────────────────────────────────────────────────
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  customer_id uuid not null references public.profiles(id),
  status project_status not null default 'draft',
  city text,
  budget_level budget_level,
  assigned_designer uuid references public.profiles(id),
  created_by uuid references public.profiles(id),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role_in_project project_member_role not null,
  created_at timestamptz not null default now(),
  unique (project_id, profile_id, role_in_project)
);

-- Access helper: owning customer OR an assigned internal member OR admin.
create or replace function public.can_access_project(pid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select
    public.is_admin()
    or exists (select 1 from public.projects p where p.id = pid and p.customer_id = auth.uid())
    or exists (select 1 from public.project_members m where m.project_id = pid and m.profile_id = auth.uid());
$$;

-- ── properties / rooms / measurements ────────────────────────
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  property_type property_type,
  address_line text,
  city text,
  pincode text,
  total_area numeric,
  area_unit area_unit default 'sqft',
  bhk text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  room_name text,
  room_type room_type not null,
  notes text,
  sort_order int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.room_measurements (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  length numeric,
  width numeric,
  height numeric,
  measurement_unit measurement_unit default 'ft',
  door_count int default 0,
  window_count int default 0,
  balcony_access boolean default false,
  existing_furniture text,
  fixed_elements text,
  notes text,
  measurement_status measurement_status not null default 'not_provided',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_uploads (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  room_id uuid references public.rooms(id) on delete set null,
  bucket upload_bucket not null,
  storage_path text not null,
  file_name text,
  mime_type text,
  size_bytes bigint,
  label text,
  sort_order int default 0,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.project_activity_logs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  actor_id uuid references public.profiles(id),
  action text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ── updated_at triggers ──────────────────────────────────────
create trigger t_profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger t_leads_updated before update on public.leads for each row execute function public.set_updated_at();
create trigger t_projects_updated before update on public.projects for each row execute function public.set_updated_at();
create trigger t_properties_updated before update on public.properties for each row execute function public.set_updated_at();
create trigger t_rooms_updated before update on public.rooms for each row execute function public.set_updated_at();
create trigger t_room_measurements_updated before update on public.room_measurements for each row execute function public.set_updated_at();

-- ── Indexes ──────────────────────────────────────────────────
create index idx_projects_customer on public.projects(customer_id);
create index idx_project_members_project on public.project_members(project_id);
create index idx_project_members_profile on public.project_members(profile_id);
create index idx_rooms_project on public.rooms(project_id);
create index idx_uploads_project on public.project_uploads(project_id);
create index idx_activity_project on public.project_activity_logs(project_id);
create index idx_leads_assigned on public.leads(assigned_sales_user);

-- ── Enable RLS on everything ─────────────────────────────────
alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.profile_roles enable row level security;
alter table public.leads enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.properties enable row level security;
alter table public.rooms enable row level security;
alter table public.room_measurements enable row level security;
alter table public.project_uploads enable row level security;
alter table public.project_activity_logs enable row level security;

-- profiles
create policy profiles_select_self on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy profiles_update_self on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- roles: readable to authenticated; managed by admin
create policy roles_select on public.roles for select using (auth.uid() is not null);
create policy roles_admin_all on public.roles for all using (public.is_admin()) with check (public.is_admin());

-- profile_roles: self-select; admin manage
create policy profile_roles_select_self on public.profile_roles for select using (profile_id = auth.uid() or public.is_admin());
create policy profile_roles_admin_all on public.profile_roles for all using (public.is_admin()) with check (public.is_admin());

-- leads: public/enquiry insert; sales+admin read/update
create policy leads_insert_any on public.leads for insert with check (true);
create policy leads_select_internal on public.leads for select using (public.has_role(array['sales','project_manager','admin','super_admin']));
create policy leads_update_internal on public.leads for update using (public.has_role(array['sales','project_manager','admin','super_admin'])) with check (public.has_role(array['sales','project_manager','admin','super_admin']));

-- projects
create policy projects_select on public.projects for select using (deleted_at is null and public.can_access_project(id));
create policy projects_insert_own on public.projects for insert with check (customer_id = auth.uid() or public.is_admin());
create policy projects_update on public.projects for update using (public.can_access_project(id)) with check (public.can_access_project(id));

-- project_members: visible to members; managed by PM/admin
create policy project_members_select on public.project_members for select using (public.can_access_project(project_id));
create policy project_members_manage on public.project_members for all using (public.has_role(array['project_manager','admin','super_admin'])) with check (public.has_role(array['project_manager','admin','super_admin']));

-- properties / rooms / measurements / uploads: scoped by project access
create policy properties_rw on public.properties for all using (public.can_access_project(project_id)) with check (public.can_access_project(project_id));
create policy rooms_rw on public.rooms for all using (public.can_access_project(project_id)) with check (public.can_access_project(project_id));
create policy measurements_rw on public.room_measurements for all
  using (exists (select 1 from public.rooms r where r.id = room_id and public.can_access_project(r.project_id)))
  with check (exists (select 1 from public.rooms r where r.id = room_id and public.can_access_project(r.project_id)));
create policy uploads_rw on public.project_uploads for all using (public.can_access_project(project_id)) with check (public.can_access_project(project_id));

-- activity logs: select by project access; insert by members; NEVER update/delete
create policy activity_select on public.project_activity_logs for select using (project_id is null or public.can_access_project(project_id));
create policy activity_insert on public.project_activity_logs for insert with check (project_id is null or public.can_access_project(project_id));
-- (no update/delete policy => append-only for all non-service-role callers)
