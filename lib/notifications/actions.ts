"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Marks one notification read. RLS (`notifications_update_own`, user_id =
 * auth.uid) is the gate — you can only touch your own. A no-op on a mock id
 * (table empty / row absent) is harmless.
 */
export async function markNotificationRead(
  id: string,
): Promise<{ ok?: boolean; error?: string }> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "Not available." };

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .is("read_at", null);
  if (error) return { error: error.message };

  revalidatePath("/notifications");
  return { ok: true };
}

/** Marks all of the caller's unread notifications read. */
export async function markAllNotificationsRead(): Promise<{
  ok?: boolean;
  error?: string;
}> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "Not available." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in." };

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);
  if (error) return { error: error.message };

  revalidatePath("/notifications");
  return { ok: true };
}
