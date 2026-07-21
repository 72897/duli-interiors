"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createProjectSchema, type CreateProjectState } from "@/lib/projects/schema";
import { logActivity } from "@/lib/activity/log";

const NOT_CONFIGURED =
  "Projects aren't connected yet. Add Supabase credentials to enable saving.";

/**
 * Creates a project + property + rooms atomically via the create_project RPC.
 * Authoritative Zod validation happens here (client wizard validation is UX).
 */
export async function createProject(
  values: unknown,
): Promise<CreateProjectState> {
  const parsed = createProjectSchema.safeParse(values);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: NOT_CONFIGURED };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again." };

  const v = parsed.data;
  const { data, error } = await supabase.rpc("create_project", {
    p_name: v.name,
    p_city: v.city,
    p_budget_level: v.budget_level,
    p_property: {
      property_type: v.property_type,
      city: v.city,
      address_line: v.address_line ?? "",
      pincode: v.pincode ?? "",
      total_area: v.total_area ?? "",
      area_unit: v.area_unit,
      bhk: v.bhk ?? "",
    },
    p_rooms: v.rooms,
  });

  if (error) return { error: error.message };

  // The RPC returns (project_id, project_code) — those OUT names are
  // deliberate: naming them id/code makes plpgsql treat them as variables and
  // any unqualified `id` in the body becomes ambiguous (see migration 0008).
  const row = Array.isArray(data) ? data[0] : data;
  const newId = row?.project_id as string | undefined;
  if (newId) await logActivity(supabase, newId, "Created the project");

  return { ok: true, code: row?.project_code as string | undefined };
}
