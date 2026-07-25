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
