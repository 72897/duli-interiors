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
