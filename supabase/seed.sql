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
