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
