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
