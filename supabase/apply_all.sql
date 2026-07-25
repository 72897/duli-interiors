-- Calyco Interiors — full schema. Paste into Supabase SQL Editor and Run.

-- ===== supabase/migrations/0001_init.sql =====
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

-- ===== supabase/migrations/0002_interiors.sql =====
-- 0002_interiors.sql — seed content gallery (sample interiors, "about data")
-- Public read for published rows; admin-only writes.

create type interior_style as enum (
  'contemporary_indian','modern','minimal','scandinavian','industrial',
  'classic','bohemian','mid_century','rustic','luxe'
);
create type interior_source as enum ('real_project','ai_concept','licensed');
create type content_status as enum ('draft','published');

create table public.interiors (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  room_type room_type not null,
  style interior_style not null,
  city text,
  summary text,
  about text,
  colour_palette text[] default '{}',
  key_materials text[] default '{}',
  featured_products text[] default '{}',
  dimensions_note text,
  budget_level budget_level,
  has_3d_structure boolean not null default false,
  structure_ref text,
  images jsonb default '[]'::jsonb,
  is_ai_generated boolean not null default false,
  source interior_source not null default 'ai_concept',
  status content_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_interiors_room_type on public.interiors(room_type);
create index idx_interiors_style on public.interiors(style);

create trigger t_interiors_updated before update on public.interiors
  for each row execute function public.set_updated_at();

alter table public.interiors enable row level security;

-- Public gallery: anyone may read published rows.
create policy interiors_select_published on public.interiors
  for select using (status = 'published' or public.is_admin());

-- Only admins write content.
create policy interiors_admin_write on public.interiors
  for all using (public.is_admin()) with check (public.is_admin());

-- Note: the ~70 sample rows are seeded from src/constants/interiors.ts via the
-- seed script (Phase 1) so the dataset has a single source of truth. Marketing
-- imagery lives in a PUBLIC `gallery` storage bucket; customer uploads stay
-- in private buckets.

-- ===== supabase/migrations/0003_project_creation.sql =====
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

-- ===== supabase/migrations/0004_partner_applications.sql =====
-- 0004_partner_applications.sql — Partner Program applications.
-- Public can apply (insert); only internal roles can read/manage.

create type partner_program as enum (
  'execution',    -- local contractors, vendors, supervisors (city execution)
  'design_studio',-- interior designers / studios using Calyco for clients
  'affiliate',    -- referral partners
  'education'     -- design colleges & institutions
);

create type partner_status as enum (
  'new',
  'contacted',
  'in_review',
  'approved',
  'rejected'
);

create table public.partner_applications (
  id uuid primary key default gen_random_uuid(),
  program partner_program not null,
  full_name text not null,
  email text not null,
  phone text not null,
  city text not null,
  company text,
  website text,
  experience_years int,
  message text,
  status partner_status not null default 'new',
  assigned_to uuid references public.profiles(id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_partner_apps_program on public.partner_applications(program);
create index idx_partner_apps_status on public.partner_applications(status);

create trigger t_partner_apps_updated before update on public.partner_applications
  for each row execute function public.set_updated_at();

alter table public.partner_applications enable row level security;

-- Anyone (including anonymous visitors) may submit an application.
create policy partner_apps_insert_any on public.partner_applications
  for insert with check (true);

-- Only internal roles may read or manage them.
create policy partner_apps_select_internal on public.partner_applications
  for select using (public.has_role(array['sales','project_manager','admin','super_admin']));

create policy partner_apps_update_internal on public.partner_applications
  for update using (public.has_role(array['sales','project_manager','admin','super_admin']))
  with check (public.has_role(array['sales','project_manager','admin','super_admin']));

-- ===== supabase/migrations/0005_storage.sql =====
-- 0005_storage.sql — private storage buckets for customer project files.
--
-- Path convention (enforced by the policies below):
--   <bucket>/<project_id>/<uuid>-<filename>
-- The first path segment must be a project the caller can access.

-- ── Private buckets ──────────────────────────────────────────
-- public=false → objects are NOT served over a public URL. Reads happen via
-- short-lived signed URLs generated server-side after an access check.
insert into storage.buckets (id, name, public)
values
  ('room-photos', 'room-photos', false),
  ('floor-plans', 'floor-plans', false),
  ('reference-images', 'reference-images', false)
on conflict (id) do nothing;

-- ── Helper: never let a malformed path error the policy ──────
-- Casting a non-uuid folder name straight to uuid would raise inside RLS.
create or replace function public.safe_uuid(t text)
returns uuid language plpgsql immutable as $$
begin
  return t::uuid;
exception when others then
  return null;
end; $$;

-- Project id from the object's first folder segment.
create or replace function public.storage_project_id(object_name text)
returns uuid language sql immutable as $$
  select public.safe_uuid((storage.foldername(object_name))[1]);
$$;

-- ── Policies on storage.objects ──────────────────────────────
drop policy if exists "calyco project files read" on storage.objects;
drop policy if exists "calyco project files insert" on storage.objects;
drop policy if exists "calyco project files update" on storage.objects;
drop policy if exists "calyco project files delete" on storage.objects;

create policy "calyco project files read" on storage.objects
  for select using (
    bucket_id in ('room-photos', 'floor-plans', 'reference-images')
    and public.can_access_project(public.storage_project_id(name))
  );

create policy "calyco project files insert" on storage.objects
  for insert with check (
    bucket_id in ('room-photos', 'floor-plans', 'reference-images')
    and public.can_access_project(public.storage_project_id(name))
  );

create policy "calyco project files update" on storage.objects
  for update using (
    bucket_id in ('room-photos', 'floor-plans', 'reference-images')
    and public.can_access_project(public.storage_project_id(name))
  );

create policy "calyco project files delete" on storage.objects
  for delete using (
    bucket_id in ('room-photos', 'floor-plans', 'reference-images')
    and public.can_access_project(public.storage_project_id(name))
  );

-- ===== supabase/migrations/0006_ai_analyses.sql =====
-- 0006_ai_analyses.sql — AI room-photo / floor-plan analysis (Phase 1.8–1.9).
--
-- Every AI call is recorded: the input, prompt version, model, raw output,
-- parsed output, token usage, timing and any error. Nothing reaches a customer
-- without passing designer review (see review_status).

create type ai_analysis_kind as enum ('room_photo', 'floor_plan');

create type ai_analysis_status as enum (
  'queued',
  'processing',
  'completed',
  'failed'
);

-- AI extraction → designer review → correction → internal confirmation.
create type ai_review_status as enum (
  'pending_review',
  'needs_correction',
  'confirmed'
);

create table public.ai_analyses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  upload_id uuid references public.project_uploads(id) on delete set null,
  room_id uuid references public.rooms(id) on delete set null,

  kind ai_analysis_kind not null,
  status ai_analysis_status not null default 'queued',
  review_status ai_review_status not null default 'pending_review',

  -- Provenance / reproducibility
  model text not null,
  prompt_version text not null,
  input jsonb not null default '{}'::jsonb,   -- what we sent (never the raw bytes)
  raw_output text,                            -- exact model response
  parsed jsonb,                               -- validated, structured result
  usage jsonb,                                -- token counts
  error text,
  duration_ms int,

  -- Designer review
  designer_notes text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,

  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_ai_analyses_project on public.ai_analyses(project_id);
create index idx_ai_analyses_upload on public.ai_analyses(upload_id);
create index idx_ai_analyses_status on public.ai_analyses(status);

create trigger t_ai_analyses_updated before update on public.ai_analyses
  for each row execute function public.set_updated_at();

alter table public.ai_analyses enable row level security;

-- Scoped to projects the caller can access (customer or assigned internal).
create policy ai_analyses_select on public.ai_analyses
  for select using (public.can_access_project(project_id));

create policy ai_analyses_insert on public.ai_analyses
  for insert with check (public.can_access_project(project_id));

create policy ai_analyses_update on public.ai_analyses
  for update using (public.can_access_project(project_id))
  with check (public.can_access_project(project_id));

-- Only internal roles may confirm/correct an analysis.
-- (Enforced in the app too; this keeps the review gate at the data layer.)
create policy ai_analyses_delete_internal on public.ai_analyses
  for delete using (public.has_role(array['designer','admin','super_admin']));

-- ===== supabase/migrations/0007_fix_create_project.sql =====
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

-- ===== supabase/migrations/0008_fix_ambiguous_id.sql =====
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

-- seed roles
-- seed.sql — baseline reference data. Safe to run repeatedly (idempotent).

insert into public.roles (key, label) values
  ('customer', 'Customer'),
  ('designer', 'Designer'),
  ('sales', 'Sales'),
  ('project_manager', 'Project Manager'),
  ('admin', 'Admin'),
  ('super_admin', 'Super Admin')
on conflict (key) do nothing;

-- Interiors gallery content (~70 rows) is seeded from src/constants/interiors.ts
-- via `scripts/seed-interiors.ts` (added in Phase 1) to keep one source of truth.

-- ===== supabase/migrations/0009_catalog_vendors.sql =====
-- 0009_catalog_vendors.sql — Product catalog + vendor directory.
--
-- Text columns (not enums) on purpose: the app's TypeScript types are the
-- source of truth for these string sets (CatalogCategory, BudgetTier,
-- RoomType, DesignStyle), and the existing DB enums don't match them
-- (e.g. budget_level is essential/premium/luxury/custom, but the app's
-- BudgetTier is budget/standard/premium/luxury). Storing the exact app
-- strings keeps a row → CatalogItem mapping trivial and lossless.
--
-- Reference data: public read for what's live; only admins write. Seeded with
-- the same rows the app used as mock, so the real path renders identically.

create table public.vendors (
  id text primary key,
  name text not null,
  city text not null,
  categories text[] not null default '{}',
  item_count int not null default 0,
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.catalog_items (
  id text primary key,
  name text not null,
  category text not null,
  room_types text[] not null default '{}',
  style_tags text[] not null default '{}',
  budget_tier text not null,
  price_min int not null,
  price_max int not null,
  dimensions text,
  material_ids text[] not null default '{}',
  vendor_id text references public.vendors(id) on delete set null,
  vendor_name text,
  image_url text not null,
  model_3d_url text,
  city_availability text[] not null default '{}',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_catalog_category on public.catalog_items(category);
create index idx_catalog_status on public.catalog_items(status);
create index idx_catalog_vendor on public.catalog_items(vendor_id);

create trigger t_vendors_updated before update on public.vendors
  for each row execute function public.set_updated_at();
create trigger t_catalog_updated before update on public.catalog_items
  for each row execute function public.set_updated_at();

alter table public.vendors enable row level security;
alter table public.catalog_items enable row level security;

-- Approved vendors and active items are public reference data — anyone signed
-- in can browse them. Draft/archived and unapproved rows stay admin-only.
create policy vendors_select_approved on public.vendors
  for select using (approved or public.has_role(array['admin','super_admin']));

create policy catalog_select_active on public.catalog_items
  for select using (status = 'active' or public.has_role(array['admin','super_admin']));

-- Only admins manage the catalog for now (vendor self-serve comes later).
create policy vendors_write_admin on public.vendors
  for all using (public.has_role(array['admin','super_admin']))
  with check (public.has_role(array['admin','super_admin']));

create policy catalog_write_admin on public.catalog_items
  for all using (public.has_role(array['admin','super_admin']))
  with check (public.has_role(array['admin','super_admin']));

-- ── Seed (mirrors the app's former mock data) ──────────────────────────────
insert into public.vendors (id, name, city, categories, item_count, approved) values
  ('v-1', 'Vardhman Modular', 'Delhi NCR', array['modular_kitchen','wardrobes'], 42, true),
  ('v-2', 'Coastal Teak Co.', 'Bengaluru', array['sofas','beds','dining'], 28, true),
  ('v-3', 'Surface Studio', 'Mumbai', array['tiles','laminates','wall_panels'], 65, true),
  ('v-4', 'Lumen Lighting', 'Pune', array['lights'], 33, false)
on conflict (id) do nothing;

insert into public.catalog_items
  (id, name, category, room_types, style_tags, budget_tier, price_min, price_max,
   dimensions, material_ids, vendor_id, vendor_name, image_url, model_3d_url,
   city_availability, status) values
  ('c-1', 'Kaveri Linen Sectional', 'sofas', array['living_room'], array['contemporary','modern_indian'], 'premium', 78000, 124000, '2400 × 950 × 780 mm', array['m-teak','m-ivory'], 'v-2', 'Coastal Teak Co.', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=60', '/3d/sofa-opt.glb', array['Delhi NCR','Mumbai','Bengaluru'], 'active'),
  ('c-2', 'Fluted Teak TV Unit', 'tv_units', array['living_room'], array['modern_indian','luxury'], 'premium', 54000, 86000, '1800 × 400 × 550 mm', array['m-teak','m-brass'], 'v-2', 'Coastal Teak Co.', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=60', null, array['Delhi NCR','Bengaluru','Pune'], 'active'),
  ('c-3', 'Handleless Modular Kitchen', 'modular_kitchen', array['kitchen'], array['contemporary','minimal'], 'premium', 210000, 420000, 'Per running foot', array['m-graphite','m-marble'], 'v-1', 'Vardhman Modular', 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=800&q=60', null, array['Delhi NCR','Mumbai'], 'active'),
  ('c-4', 'Walk-in Wardrobe System', 'wardrobes', array['wardrobe','bedroom'], array['luxury'], 'luxury', 165000, 340000, 'Per running foot', array['m-oak','m-brass'], 'v-1', 'Vardhman Modular', 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?auto=format&fit=crop&w=800&q=60', null, array['Delhi NCR','Bengaluru'], 'active'),
  ('c-5', 'Carved Puja Unit', 'puja_units', array['puja_room'], array['modern_indian'], 'standard', 32000, 68000, '900 × 450 × 1800 mm', array['m-teak','m-brass'], 'v-2', 'Coastal Teak Co.', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=60', null, array['Delhi NCR','Mumbai','Pune','Ahmedabad'], 'active'),
  ('c-6', 'Solid Oak Dining Six', 'dining', array['dining'], array['japandi','minimal'], 'standard', 48000, 82000, '1800 × 900 × 750 mm', array['m-oak'], 'v-2', 'Coastal Teak Co.', 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=60', null, array['Bengaluru','Chennai','Hyderabad'], 'active'),
  ('c-7', 'Brass Pendant Cluster', 'lights', array['dining','living_room'], array['luxury','contemporary'], 'premium', 18000, 42000, 'Ø 450 mm', array['m-brass'], 'v-4', 'Lumen Lighting', 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=60', null, array['Delhi NCR','Mumbai','Pune'], 'active'),
  ('c-8', 'Statuario Floor Tile', 'tiles', array['bathroom','living_room'], array['luxury'], 'luxury', 240, 460, '800 × 1600 mm', array['m-marble'], 'v-3', 'Surface Studio', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=60', null, array['Delhi NCR','Mumbai','Bengaluru','Pune'], 'active'),
  ('c-9', 'Graphite Laminate', 'laminates', array['kitchen','wardrobe'], array['contemporary'], 'budget', 95, 210, '8 × 4 ft sheet', array['m-graphite'], 'v-3', 'Surface Studio', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=60', null, array['Delhi NCR','Mumbai','Ahmedabad'], 'active'),
  ('c-10', 'Fluted Wall Panel', 'wall_panels', array['living_room','bedroom'], array['modern_indian','luxury'], 'premium', 420, 780, 'Per sqft', array['m-teak'], 'v-3', 'Surface Studio', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=60', null, array['Delhi NCR','Bengaluru'], 'active'),
  ('c-11', 'Upholstered Platform Bed', 'beds', array['bedroom'], array['minimal','japandi'], 'standard', 52000, 98000, '1980 × 1830 mm (King)', array['m-ivory','m-oak'], 'v-2', 'Coastal Teak Co.', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=60', null, array['Delhi NCR','Mumbai','Bengaluru','Chennai'], 'active'),
  ('c-12', 'Ceramic Vase Set', 'decor', array['living_room'], array['minimal','rental_friendly'], 'budget', 2400, 6800, 'Set of 3', array['m-terracotta'], 'v-3', 'Surface Studio', 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=60', null, array['Delhi NCR','Mumbai','Bengaluru','Pune','Chennai'], 'active')
on conflict (id) do nothing;

-- ===== supabase/migrations/0010_estimates_consultations_comments.sql =====
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

-- ===== supabase/migrations/0011_soft_delete_profiles.sql =====
-- 0011_soft_delete_profiles.sql — reversible account deactivation.
--
-- Soft delete only: no auth.users are destroyed. A deactivated profile keeps
-- its row (and its projects/history stay intact) but the person is blocked from
-- the app and hidden from active lists. Reversible by clearing deleted_at.
--
-- deleted_at IS NULL  → active
-- deleted_at NOT NULL → deactivated

alter table public.profiles add column if not exists deleted_at timestamptz;
create index if not exists idx_profiles_deleted_at on public.profiles(deleted_at);

-- A user can already update their own row (profiles_update_self), which covers
-- self-deactivation. Admins also need to deactivate/reactivate ANY user, so add
-- an admin update policy.
drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin on public.profiles
  for update using (public.is_admin())
  with check (public.is_admin());

-- ===== supabase/migrations/0012_signup_role_onboarding.sql =====
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

-- ===== supabase/migrations/0013_notifications_review.sql =====
-- 0013_notifications_review.sql — real notifications + review-workflow plumbing.
--
-- Notifications are created for OTHER users (a customer's submission alerts
-- reviewers; an admin's approval alerts the customer), which plain RLS can't
-- express (a user can't insert into someone else's row). So inserts go through
-- SECURITY DEFINER functions with their own authorization checks; users only
-- ever SELECT and UPDATE (mark-read) their own rows.

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,            -- project_update|design_ready|comment|review_needed|estimate_ready|...
  title text not null,
  body text not null,
  action_url text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_notifications_user on public.notifications(user_id, created_at desc);

alter table public.notifications enable row level security;

create policy notifications_select_own on public.notifications
  for select using (user_id = auth.uid());

-- Users can only flip their own notifications' read state, nothing else.
create policy notifications_update_own on public.notifications
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ── Notify one user (staff → customer, e.g. on approval) ───────────────────
create or replace function public.notify_user(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_body text,
  p_action_url text default null
) returns void language plpgsql security definer set search_path = public as $$
begin
  -- Only staff may push a notification to another account.
  if not public.has_role(array['designer','sales','project_manager','admin','super_admin']) then
    raise exception 'not authorized to notify users';
  end if;
  insert into public.notifications (user_id, type, title, body, action_url)
  values (p_user_id, p_type, p_title, p_body, p_action_url);
end; $$;

-- ── Notify all reviewers (customer → staff, e.g. on submission) ────────────
create or replace function public.notify_reviewers(
  p_project_id uuid,
  p_type text,
  p_title text,
  p_body text,
  p_action_url text default null
) returns void language plpgsql security definer set search_path = public as $$
begin
  -- The caller must be able to access the project they're raising this for.
  if not public.can_access_project(p_project_id) then
    raise exception 'not authorized for this project';
  end if;
  insert into public.notifications (user_id, type, title, body, action_url)
  select distinct pr.profile_id, p_type, p_title, p_body, p_action_url
  from public.profile_roles pr
  join public.roles r on r.id = pr.role_id
  where r.key in ('designer','project_manager','admin','super_admin');
end; $$;

revoke all on function public.notify_user(uuid, text, text, text, text) from public, anon;
revoke all on function public.notify_reviewers(uuid, text, text, text, text) from public, anon;
grant execute on function public.notify_user(uuid, text, text, text, text) to authenticated;
grant execute on function public.notify_reviewers(uuid, text, text, text, text) to authenticated;

-- ===== supabase/migrations/0014_notification_prefs.sql =====
-- 0014_notification_prefs.sql — persist per-user notification channel prefs.
--
-- Backs the toggles on /settings/notifications (were display-only mock). These
-- gate which channels a future email/WhatsApp sender uses; in-app notifications
-- always show. Covered by the existing profiles RLS (self-select/self-update).

alter table public.profiles add column if not exists notify_email boolean not null default true;
alter table public.profiles add column if not exists notify_whatsapp boolean not null default false;

-- ===== supabase/migrations/0015_vendor_org.sql =====
-- 0015_vendor_org.sql — link vendor users to a vendor organization.
--
-- A vendor-role user belongs to one vendor org (profiles.vendor_id → vendors).
-- That link scopes "my SKUs": a vendor can submit and edit catalog items for
-- their own org (as drafts), see their own items regardless of status, and an
-- admin approves them (status → active) before they go public.

alter table public.profiles
  add column if not exists vendor_id text references public.vendors(id) on delete set null;
create index if not exists idx_profiles_vendor on public.profiles(vendor_id);

-- The caller's vendor org, if any. security definer so RLS on profiles can't
-- recurse. Returns null for non-vendors.
create or replace function public.my_vendor_id()
returns text language sql stable security definer set search_path = public as $$
  select vendor_id from public.profiles where id = auth.uid();
$$;

-- Recreate the catalog read policy to also let a vendor see their OWN items
-- (drafts included), not just active ones.
drop policy if exists catalog_select_active on public.catalog_items;
create policy catalog_select_active on public.catalog_items
  for select using (
    status = 'active'
    or public.has_role(array['admin','super_admin'])
    or (vendor_id is not null and vendor_id = public.my_vendor_id())
  );

-- Vendors submit new items for their own org, as DRAFT only — public listing
-- still requires an admin to approve (status → active) via catalog_write_admin.
create policy catalog_vendor_insert on public.catalog_items
  for insert with check (
    vendor_id is not null
    and vendor_id = public.my_vendor_id()
    and status = 'draft'
  );

-- Vendors edit their own items but can't self-publish: the resulting row must
-- stay 'draft'. Only an admin flips a row to 'active'.
create policy catalog_vendor_update on public.catalog_items
  for update using (vendor_id is not null and vendor_id = public.my_vendor_id())
  with check (vendor_id = public.my_vendor_id() and status = 'draft');

-- ===== supabase/migrations/0016_project_items.sql =====
-- 0016_project_items.sql — products a customer/designer picks for a project.
--
-- The Coohom "add to your design" analogue: choose catalog items for a project,
-- with a room and quantity. Scoped by can_access_project (owner + members +
-- admin), like the rest of the workspace.

create table public.project_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  catalog_item_id text not null references public.catalog_items(id) on delete cascade,
  room_name text,
  quantity int not null default 1 check (quantity between 1 and 999),
  added_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_project_items_project on public.project_items(project_id);
create unique index uq_project_item on public.project_items(project_id, catalog_item_id, coalesce(room_name, ''));

alter table public.project_items enable row level security;

create policy project_items_rw on public.project_items
  for all using (public.can_access_project(project_id))
  with check (public.can_access_project(project_id));
