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
