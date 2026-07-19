import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Appends a project activity entry. Best-effort: a logging failure must never
 * fail the action that triggered it. RLS (`activity_insert` = can_access_project)
 * is the gate; the actor is whoever's calling.
 */
export async function logActivity(
  supabase: SupabaseClient,
  projectId: string,
  action: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("project_activity_logs").insert({
      project_id: projectId,
      actor_id: user?.id ?? null,
      action,
      metadata: metadata ?? {},
    });
  } catch {
    // swallow — activity is a side record, not the operation
  }
}
