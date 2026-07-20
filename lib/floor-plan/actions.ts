"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity/log";

export type SaveFloorPlanState = { ok?: boolean; error?: string };

const point = z.object({
  x: z.number().finite().min(0).max(400),
  y: z.number().finite().min(0).max(400),
});

const planSchema = z.object({
  version: z.literal(1),
  halfFtSnap: z.boolean().optional(),
  rooms: z
    .array(
      z.object({
        id: z.string().min(1).max(40),
        name: z.string().trim().max(60),
        points: z.array(point).max(80),
      }),
    )
    .max(60),
  openings: z
    .array(
      z.object({
        id: z.string().min(1).max(40),
        kind: z.enum(["door", "window"]),
        x: z.number().finite().min(0).max(400),
        y: z.number().finite().min(0).max(400),
      }),
    )
    .max(200),
});

/**
 * Upserts the project's floor plan (one row per project). RLS
 * (can_access_project) is the real gate; the Zod schema just keeps the blob
 * bounded and well-formed. Degrades cleanly if the table isn't migrated yet.
 */
export async function saveFloorPlan(input: {
  projectId: string;
  data: unknown;
}): Promise<SaveFloorPlanState> {
  const projectId = z.string().uuid().safeParse(input.projectId);
  if (!projectId.success) return { error: "Invalid project." };

  const parsed = planSchema.safeParse(input.data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid floor plan." };
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "Not available." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again." };

  const { error } = await supabase.from("floor_plans").upsert(
    {
      project_id: projectId.data,
      data: parsed.data,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "project_id" },
  );

  if (error) {
    // Table missing (migration not applied yet): PostgREST reports PGRST205
    // via the schema cache; Postgres direct reports 42P01.
    if (error.code === "PGRST205" || error.code === "42P01") {
      return {
        error: "Saving isn't enabled yet — ask the team to apply migration 0017 (floor_plans).",
      };
    }
    return { error: error.message };
  }

  await logActivity(supabase, projectId.data, "Updated the floor plan", {
    rooms: parsed.data.rooms.length,
  });

  revalidatePath(`/projects/${projectId.data}/floor-plan`);
  return { ok: true };
}
