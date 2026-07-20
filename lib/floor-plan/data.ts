import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EMPTY_PLAN, polygonAreaSqFt, type FloorPlanData, type FpRoom } from "./types";

/**
 * Loads a project's saved floor plan. Returns an empty plan when none exists
 * yet OR when the table hasn't been migrated in — the editor is fully usable
 * in-memory either way; only saving needs the table.
 */
export async function getFloorPlan(projectId: string): Promise<FloorPlanData> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return EMPTY_PLAN;

  const { data, error } = await supabase
    .from("floor_plans")
    .select("data")
    .eq("project_id", projectId)
    .maybeSingle();

  if (error || !data?.data) return EMPTY_PLAN;

  const plan = data.data as Partial<FloorPlanData>;
  return {
    version: 1,
    halfFtSnap: plan.halfFtSnap ?? false,
    rooms: Array.isArray(plan.rooms) ? plan.rooms : [],
    openings: Array.isArray(plan.openings) ? plan.openings : [],
  };
}

export type FloorPlanSummary = { areaSqFt: number; roomCount: number };

/**
 * Batch-loads drawn carpet areas for a set of projects (one query, RLS-scoped)
 * so a list view can show real geometry without an N+1. Missing table or no
 * plan → the project simply won't appear in the map.
 */
export async function getFloorPlanAreas(
  projectIds: string[],
): Promise<Record<string, FloorPlanSummary>> {
  const out: Record<string, FloorPlanSummary> = {};
  if (projectIds.length === 0) return out;

  const supabase = createSupabaseServerClient();
  if (!supabase) return out;

  const { data, error } = await supabase
    .from("floor_plans")
    .select("project_id, data")
    .in("project_id", projectIds);
  if (error || !data) return out;

  for (const row of data) {
    const rooms = (row.data as Partial<FloorPlanData> | null)?.rooms;
    if (!Array.isArray(rooms)) continue;
    const area = (rooms as FpRoom[]).reduce(
      (s, r) => s + polygonAreaSqFt(r.points ?? []),
      0,
    );
    out[row.project_id as string] = { areaSqFt: area, roomCount: rooms.length };
  }
  return out;
}
