-- ── Consultation ops: who requested it ───────────────────────────────────
-- Staff already SELECT every consultation (consultations_select has a has_role
-- branch), but profiles_select is admin/self-only — so a designer can read the
-- consultation yet not the customer's name. Denormalise the requester's name
-- onto the row (mirrors comments.author_name) so the staff calendar shows whose
-- session it is without widening profile access. RLS is unchanged; the column
-- rides the row's existing visibility.
alter table public.consultations add column if not exists customer_name text;

-- Backfill existing rows from profiles (runs with migration privileges).
update public.consultations c
set customer_name = p.full_name
from public.profiles p
where p.id = c.user_id
  and c.customer_name is null;
