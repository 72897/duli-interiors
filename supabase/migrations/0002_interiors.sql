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
