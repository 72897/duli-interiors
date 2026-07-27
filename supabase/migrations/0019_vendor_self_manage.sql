-- ── Vendor self-management ────────────────────────────────────────────────
-- A linked vendor (profiles.vendor_id = vendors.id) manages their draft catalog
-- items already (0015). Let them also READ their own brand row (even before it
-- is approved) and EDIT its display fields — but never self-approve.
--
-- Reading own row is a plain policy. Editing goes through a SECURITY DEFINER
-- function that only ever writes name/city/categories, so a vendor cannot flip
-- `approved` on themselves the way a broad UPDATE policy would allow.

drop policy if exists vendors_select_own on public.vendors;
create policy vendors_select_own on public.vendors
  for select
  using (id = public.my_vendor_id());

create or replace function public.update_my_vendor(
  p_name text,
  p_city text,
  p_categories text[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  vid uuid;
begin
  vid := public.my_vendor_id();
  if vid is null then
    raise exception 'No vendor linked to this account';
  end if;
  update public.vendors
     set name = coalesce(nullif(btrim(p_name), ''), name),
         city = p_city,
         categories = coalesce(p_categories, categories)
   where id = vid;
end;
$$;

revoke all on function public.update_my_vendor(text, text, text[]) from anon;
grant execute on function public.update_my_vendor(text, text, text[]) to authenticated;

-- Vendor "leads" = where their products have been specified on projects.
-- Vendors can't read project_items (can_access_project RLS), so expose only
-- privacy-safe aggregates: product, how many times it was chosen, and which
-- cities — never customer identity or project detail.
create or replace function public.my_vendor_placements()
returns table (
  catalog_item_id text,
  item_name text,
  placements bigint,
  cities text[]
)
language sql
security definer
set search_path = public
as $$
  select pi.catalog_item_id,
         ci.name,
         count(*)::bigint as placements,
         array_agg(distinct p.city) filter (where p.city is not null) as cities
  from public.project_items pi
  join public.catalog_items ci on ci.id = pi.catalog_item_id
  join public.projects p on p.id = pi.project_id
  where ci.vendor_id = public.my_vendor_id()
  group by pi.catalog_item_id, ci.name
  order by placements desc;
$$;

revoke all on function public.my_vendor_placements() from anon;
grant execute on function public.my_vendor_placements() to authenticated;
