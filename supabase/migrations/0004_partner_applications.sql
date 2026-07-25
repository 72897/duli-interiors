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
