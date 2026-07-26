-- 0006_ai_analyses.sql — AI room-photo / floor-plan analysis (Phase 1.8–1.9).
--
-- Every AI call is recorded: the input, prompt version, model, raw output,
-- parsed output, token usage, timing and any error. Nothing reaches a customer
-- without passing designer review (see review_status).

create type ai_analysis_kind as enum ('room_photo', 'floor_plan');

create type ai_analysis_status as enum (
  'queued',
  'processing',
  'completed',
  'failed'
);

-- AI extraction → designer review → correction → internal confirmation.
create type ai_review_status as enum (
  'pending_review',
  'needs_correction',
  'confirmed'
);

create table public.ai_analyses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  upload_id uuid references public.project_uploads(id) on delete set null,
  room_id uuid references public.rooms(id) on delete set null,

  kind ai_analysis_kind not null,
  status ai_analysis_status not null default 'queued',
  review_status ai_review_status not null default 'pending_review',

  -- Provenance / reproducibility
  model text not null,
  prompt_version text not null,
  input jsonb not null default '{}'::jsonb,   -- what we sent (never the raw bytes)
  raw_output text,                            -- exact model response
  parsed jsonb,                               -- validated, structured result
  usage jsonb,                                -- token counts
  error text,
  duration_ms int,

  -- Designer review
  designer_notes text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,

  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_ai_analyses_project on public.ai_analyses(project_id);
create index idx_ai_analyses_upload on public.ai_analyses(upload_id);
create index idx_ai_analyses_status on public.ai_analyses(status);

create trigger t_ai_analyses_updated before update on public.ai_analyses
  for each row execute function public.set_updated_at();

alter table public.ai_analyses enable row level security;

-- Scoped to projects the caller can access (customer or assigned internal).
create policy ai_analyses_select on public.ai_analyses
  for select using (public.can_access_project(project_id));

create policy ai_analyses_insert on public.ai_analyses
  for insert with check (public.can_access_project(project_id));

create policy ai_analyses_update on public.ai_analyses
  for update using (public.can_access_project(project_id))
  with check (public.can_access_project(project_id));

-- Only internal roles may confirm/correct an analysis.
-- (Enforced in the app too; this keeps the review gate at the data layer.)
create policy ai_analyses_delete_internal on public.ai_analyses
  for delete using (public.has_role(array['designer','admin','super_admin']));
