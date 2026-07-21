"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity/log";

export type ProjectItemState = { ok?: boolean; error?: string };

const addSchema = z.object({
  projectId: z.string().uuid(),
  catalogItemId: z.string().min(1).max(80),
  roomName: z.string().trim().max(80).optional(),
  quantity: z.coerce.number().int().min(1).max(999).default(1),
});

/**
 * Adds a catalog item to a project (the Coohom "add to your design"). RLS
 * (project_items_rw = can_access_project) is the gate. A unique index on
 * (project, item, room) means re-adding the same piece to the same room just
 * bumps quantity instead of erroring.
 */
export async function addItemToProject(input: {
  projectId: string;
  catalogItemId: string;
  roomName?: string;
  quantity?: number;
}): Promise<ProjectItemState> {
  const parsed = addSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid selection." };

  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "Not available." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in." };

  // Already in this room? bump quantity. Else insert.
  const { data: existing } = await supabase
    .from("project_items")
    .select("id, quantity")
    .eq("project_id", parsed.data.projectId)
    .eq("catalog_item_id", parsed.data.catalogItemId)
    .eq("room_name", parsed.data.roomName ?? "")
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("project_items")
      .update({ quantity: (existing.quantity as number) + parsed.data.quantity })
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("project_items").insert({
      project_id: parsed.data.projectId,
      catalog_item_id: parsed.data.catalogItemId,
      room_name: parsed.data.roomName || null,
      quantity: parsed.data.quantity,
      added_by: user.id,
    });
    if (error) return { error: error.message };
  }

  await logActivity(supabase, parsed.data.projectId, "Added a product to the project");
  revalidatePath(`/projects/${parsed.data.projectId}/catalog`);
  return { ok: true };
}

/** Removes a selected item from a project. RLS scopes the delete. */
export async function removeProjectItem(input: {
  id: string;
  projectId: string;
}): Promise<ProjectItemState> {
  if (!z.string().uuid().safeParse(input.id).success) {
    return { error: "Invalid item." };
  }
  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "Not available." };

  const { error } = await supabase.from("project_items").delete().eq("id", input.id);
  if (error) return { error: error.message };

  revalidatePath(`/projects/${input.projectId}/catalog`);
  return { ok: true };
}

/** Sets the quantity of a selected item (1–999). */
export async function setProjectItemQuantity(input: {
  id: string;
  projectId: string;
  quantity: number;
}): Promise<ProjectItemState> {
  const q = z.coerce.number().int().min(1).max(999).safeParse(input.quantity);
  if (!z.string().uuid().safeParse(input.id).success || !q.success) {
    return { error: "Invalid quantity." };
  }
  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "Not available." };

  const { error } = await supabase
    .from("project_items")
    .update({ quantity: q.data })
    .eq("id", input.id);
  if (error) return { error: error.message };

  revalidatePath(`/projects/${input.projectId}/catalog`);
  return { ok: true };
}
