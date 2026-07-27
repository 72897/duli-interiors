"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const LEAD_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "not_qualified",
  "consultation_booked",
  "converted_to_project",
  "lost",
] as const;

/**
 * Move a lead along the pipeline. RLS (`leads_update_internal` = sales / PM /
 * admin) is the gate; a non-staff caller's update simply affects 0 rows.
 */
export async function setLeadStatus(
  id: string,
  status: string,
): Promise<{ ok?: boolean; error?: string }> {
  const parsed = z
    .object({ id: z.string().uuid(), status: z.enum(LEAD_STATUSES) })
    .safeParse({ id, status });
  if (!parsed.success) return { error: "Invalid status." };

  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "Not available right now." };

  const { error } = await supabase
    .from("leads")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id);
  if (error) return { error: error.message };

  revalidatePath("/leads");
  return { ok: true };
}
