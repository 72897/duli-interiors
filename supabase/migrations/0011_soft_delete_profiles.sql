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
-- an admin update policy. `drop ... if exists` first so this whole migration is
-- safe to re-run (Postgres has no `create policy if not exists`).
drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin on public.profiles
  for update using (public.is_admin())
  with check (public.is_admin());
