-- 0014_notification_prefs.sql — persist per-user notification channel prefs.
--
-- Backs the toggles on /settings/notifications (were display-only mock). These
-- gate which channels a future email/WhatsApp sender uses; in-app notifications
-- always show. Covered by the existing profiles RLS (self-select/self-update).

alter table public.profiles add column if not exists notify_email boolean not null default true;
alter table public.profiles add column if not exists notify_whatsapp boolean not null default false;
