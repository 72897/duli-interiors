"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMyRoles, isStaffRole } from "@/lib/services";
import { logActivity } from "@/lib/activity/log";

export type EstimateBuildState = { ok?: boolean; error?: string };

const lineSchema = z.object({
  roomName: z.string().trim().max(80).optional(),
  category: z.string().trim().min(1).max(60),
  description: z.string().trim().min(1).max(200),
  quantity: z.coerce.number().min(0),
  unit: z.string().trim().min(1).max(20),
  unitRate: z.coerce.number().int().min(0),
});

const schema = z.object({
  projectId: z.string().uuid(),
  title: z.string().trim().min(1).max(120),
  discount: z.coerce.number().int().min(0).default(0),
  items: z.array(lineSchema).min(1, "Add at least one line item."),
});

/**
 * Creates a real estimate + its line items for a project (staff only). RLS on
 * estimates (can_access_project) scopes the write; the role re-check gives a
 * clean message. Totals are computed server-side so the client can't fake them.
 * The tax line is an 18% GST placeholder, not a tax engine.
 */
export async function createEstimate(input: {
  projectId: string;
  title: string;
  discount?: number;
  items: {
    roomName?: string;
    category: string;
    description: string;
    quantity: number;
    unit: string;
    unitRate: number;
  }[];
}): Promise<EstimateBuildState> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid estimate." };
  }

  const roles = await getMyRoles();
  if (!isStaffRole(roles)) return { error: "Only staff can create estimates." };

  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "Not available." };

  const lines = parsed.data.items.map((li, i) => ({
    ...li,
    amount: Math.round(li.quantity * li.unitRate),
    sort: i,
  }));
  const subtotal = lines.reduce((s, li) => s + li.amount, 0);
  const discount = Math.min(parsed.data.discount, subtotal);
  const tax = Math.round((subtotal - discount) * 0.18);
  const total = subtotal - discount + tax;

  const { data: est, error: estErr } = await supabase
    .from("estimates")
    .insert({
      project_id: parsed.data.projectId,
      title: parsed.data.title,
      status: "sent",
      subtotal,
      tax,
      discount,
      total,
      currency: "INR",
    })
    .select("id")
    .single();
  if (estErr || !est) return { error: estErr?.message ?? "Could not create estimate." };

  const { error: itemsErr } = await supabase.from("estimate_items").insert(
    lines.map((li) => ({
      estimate_id: est.id,
      room_name: li.roomName || null,
      category: li.category,
      description: li.description,
      quantity: li.quantity,
      unit: li.unit,
      unit_rate: li.unitRate,
      amount: li.amount,
      sort_order: li.sort,
    })),
  );
  if (itemsErr) return { error: itemsErr.message };

  // Notify the customer their estimate is ready.
  const { data: project } = await supabase
    .from("projects")
    .select("name, customer_id")
    .eq("id", parsed.data.projectId)
    .maybeSingle();
  if (project?.customer_id) {
    await supabase.rpc("notify_user", {
      p_user_id: project.customer_id,
      p_type: "estimate_ready",
      p_title: "Your estimate is ready",
      p_body: `We've prepared an estimate for "${project.name}".`,
      p_action_url: `/projects/${parsed.data.projectId}/estimate`,
    });
  }

  await logActivity(supabase, parsed.data.projectId, "Created an estimate", {
    total,
  });

  revalidatePath(`/projects/${parsed.data.projectId}/estimate`);
  revalidatePath("/estimates");
  return { ok: true };
}

const decisionSchema = z.object({
  estimateId: z.string().uuid(),
  projectId: z.string().uuid(),
  status: z.enum(["approved", "revision_requested"]),
  note: z.string().trim().max(500).optional(),
});

/**
 * The customer's decision on an estimate — approve it, or ask for changes.
 * RLS (estimates_rw = can_access_project) is the gate; any project member can
 * technically call it, but the UI only shows it to the customer on a sent
 * estimate. Notifies the review team either way.
 */
export async function setEstimateStatus(input: {
  estimateId: string;
  projectId: string;
  status: "approved" | "revision_requested";
  note?: string;
}): Promise<EstimateBuildState> {
  const parsed = decisionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid request." };
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "Not available." };

  const { error } = await supabase
    .from("estimates")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.estimateId);
  if (error) return { error: error.message };

  const approved = parsed.data.status === "approved";
  const { data: project } = await supabase
    .from("projects")
    .select("name")
    .eq("id", parsed.data.projectId)
    .maybeSingle();
  const name = project?.name ?? "your project";

  await supabase.rpc("notify_reviewers", {
    p_project_id: parsed.data.projectId,
    p_type: approved ? "estimate_approved" : "estimate_revision_requested",
    p_title: approved ? "Estimate approved" : "Estimate changes requested",
    p_body: approved
      ? `The customer approved the estimate for "${name}".`
      : `The customer requested changes to the estimate for "${name}".${parsed.data.note ? ` Note: ${parsed.data.note}` : ""}`,
    p_action_url: `/projects/${parsed.data.projectId}/estimate`,
  });

  await logActivity(
    supabase,
    parsed.data.projectId,
    approved ? "Approved the estimate" : "Requested changes to the estimate",
  );

  revalidatePath(`/projects/${parsed.data.projectId}/estimate`);
  revalidatePath("/estimates");
  return { ok: true };
}
