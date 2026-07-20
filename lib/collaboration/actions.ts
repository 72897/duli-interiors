"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser, getMyRoles, isStaffRole } from "@/lib/services";
import { CITIES, type Role } from "@/lib/types";
import { sendEmail, brandedEmail, teamInbox } from "@/lib/email/resend";
import { logActivity } from "@/lib/activity/log";

export type CommentState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

const schema = z.object({
  projectId: z.string().uuid("Invalid project."),
  body: z
    .string()
    .trim()
    .min(1, "Write something first.")
    .max(2000, "Keep it under 2000 characters."),
  // Only honoured for staff; a customer can never post an internal note.
  internal: z.boolean().optional(),
});

const STAFF_PRIORITY: Role[] = [
  "super_admin",
  "admin",
  "project_manager",
  "designer",
  "sales",
];

/**
 * Posts a comment on a project. RLS is the real gate — the insert policy is
 * `can_access_project(project_id) AND author_id = auth.uid()`, so a user can
 * only comment on a project they can see, as themselves. This action just
 * validates, stamps author identity, and revalidates the thread.
 */
export async function postComment(
  _prev: CommentState,
  formData: FormData,
): Promise<CommentState> {
  const parsed = schema.safeParse({
    projectId: formData.get("projectId"),
    body: formData.get("body"),
    internal: formData.get("internal") === "on",
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "Comments aren't available right now." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in to comment." };

  const [profile, roles] = await Promise.all([getCurrentUser(), getMyRoles()]);
  const staff = isStaffRole(roles);
  const primaryRole: Role =
    STAFF_PRIORITY.find((r) => roles.includes(r)) ?? "customer";

  const authorName = profile?.name || user.email?.split("@")[0] || "Member";
  const isInternal = staff && parsed.data.internal;

  const { error } = await supabase.from("comments").insert({
    project_id: parsed.data.projectId,
    author_id: user.id, // must equal auth.uid() for the RLS check
    author_name: authorName,
    author_role: primaryRole,
    // Internal notes are staff-only; ignore the flag for everyone else.
    visibility: isInternal ? "internal" : "public",
    body: parsed.data.body,
    target_type: "project",
    target_id: parsed.data.projectId,
  });

  if (error) return { error: error.message };

  // Notify the other side of a public comment. Internal notes stay silent to
  // the customer. Errors are ignored — a failed ping must not fail the comment.
  if (!isInternal) {
    if (staff) {
      // Staff → customer (project owner).
      const { data: project } = await supabase
        .from("projects")
        .select("name, customer_id")
        .eq("id", parsed.data.projectId)
        .maybeSingle();
      if (project?.customer_id && project.customer_id !== user.id) {
        await supabase.rpc("notify_user", {
          p_user_id: project.customer_id,
          p_type: "comment",
          p_title: `${authorName} commented on your project`,
          p_body: parsed.data.body.slice(0, 140),
          p_action_url: `/projects/${parsed.data.projectId}/comments`,
        });
      }
    } else {
      // Customer → reviewers.
      await supabase.rpc("notify_reviewers", {
        p_project_id: parsed.data.projectId,
        p_type: "comment",
        p_title: `${authorName} commented`,
        p_body: parsed.data.body.slice(0, 140),
        p_action_url: `/projects/${parsed.data.projectId}/comments`,
      });
    }
  }

  if (!isInternal) {
    await logActivity(supabase, parsed.data.projectId, "Posted a comment");
  }

  revalidatePath(`/projects/${parsed.data.projectId}/comments`);
  return { ok: true };
}

export type ConsultationState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

/**
 * Staff moves a consultation through its lifecycle (requested → scheduled →
 * completed / cancelled) and optionally assigns a designer. RLS
 * (consultations_update_staff) is the gate; the role re-check gives a clean
 * message. Notifies the customer on the change.
 */
export async function setConsultationStatus(input: {
  id: string;
  status: "scheduled" | "completed" | "cancelled";
  designerName?: string;
}): Promise<{ ok?: boolean; error?: string }> {
  if (!z.string().uuid().safeParse(input.id).success) {
    return { error: "Invalid consultation." };
  }
  const roles = await getMyRoles();
  if (!isStaffRole(roles)) return { error: "Staff only." };

  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "Not available." };

  const patch: Record<string, unknown> = { status: input.status };
  if (input.designerName) patch.designer_name = input.designerName;

  const { data: row, error } = await supabase
    .from("consultations")
    .update(patch)
    .eq("id", input.id)
    .select("user_id, city, mode")
    .maybeSingle();
  if (error) return { error: error.message };

  if (row?.user_id) {
    await supabase.rpc("notify_user", {
      p_user_id: row.user_id,
      p_type: "consultation_reminder",
      p_title:
        input.status === "scheduled"
          ? "Your consultation is confirmed"
          : `Your consultation is ${input.status}`,
      p_body:
        input.status === "scheduled"
          ? `A designer confirmed your ${String(row.mode).replace("_", " ")} in ${row.city}.`
          : `Your consultation is now ${input.status}.`,
      p_action_url: "/consultations",
    });
  }

  revalidatePath("/consultations");
  return { ok: true };
}

const consultationSchema = z.object({
  mode: z.enum(["call", "video", "site_visit"]),
  city: z.enum(CITIES),
  // datetime-local gives "YYYY-MM-DDTHH:mm"; require a real future time.
  scheduledAt: z
    .string()
    .min(1, "Pick a date and time.")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Pick a valid date and time.")
    .refine((v) => Date.parse(v) > Date.now(), "Choose a time in the future."),
  // "" from an unselected dropdown becomes undefined (no project).
  projectId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  notes: z.string().trim().max(1000, "Keep notes under 1000 characters.").optional(),
});

/**
 * Books a consultation request. RLS insert policy allows a user to create their
 * own row (user_id = auth.uid) or staff to create on anyone's behalf. Requests
 * land as status 'requested' with no designer assigned — staff schedule them.
 */
export async function requestConsultation(
  _prev: ConsultationState,
  formData: FormData,
): Promise<ConsultationState> {
  const parsed = consultationSchema.safeParse({
    mode: formData.get("mode"),
    city: formData.get("city"),
    scheduledAt: formData.get("scheduledAt"),
    projectId: formData.get("projectId") ?? "",
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "Booking isn't available right now." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in to book a consultation." };

  // Requester's name, denormalised so staff see whose consultation it is.
  const { data: prof } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();
  const customerName = prof?.full_name || user.email?.split("@")[0] || "Customer";

  const base = {
    user_id: user.id, // must equal auth.uid() for the RLS check
    project_id: parsed.data.projectId ?? null,
    city: parsed.data.city,
    scheduled_at: new Date(parsed.data.scheduledAt).toISOString(),
    status: "requested",
    mode: parsed.data.mode,
    notes: parsed.data.notes || null,
  };

  let { error } = await supabase
    .from("consultations")
    .insert({ ...base, customer_name: customerName });
  // Degrade if 0018 isn't applied yet (unknown column) — book without the name
  // rather than fail the request.
  if (error && (error.code === "PGRST204" || error.code === "42703")) {
    ({ error } = await supabase.from("consultations").insert(base));
  }

  if (error) return { error: error.message };

  // Alert reviewers when it's tied to a project (notify_reviewers is
  // project-scoped). A booking failure to notify must not fail the request.
  if (parsed.data.projectId) {
    await supabase.rpc("notify_reviewers", {
      p_project_id: parsed.data.projectId,
      p_type: "consultation_reminder",
      p_title: "New consultation requested",
      p_body: `A ${parsed.data.mode.replace("_", " ")} in ${parsed.data.city} was requested.`,
      p_action_url: "/consultations",
    });
  }

  // Email the team regardless of project link — consultations are leads.
  const inbox = teamInbox();
  if (inbox) {
    const mode = parsed.data.mode.replace("_", " ");
    const when = new Date(parsed.data.scheduledAt).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    await sendEmail({
      to: inbox,
      replyTo: user.email ?? undefined,
      subject: `New consultation request — ${parsed.data.city}`,
      html: brandedEmail({
        heading: "A customer requested a consultation",
        bodyHtml: `<strong>${mode}</strong> in ${parsed.data.city}, preferred ${when}.${parsed.data.notes ? `<br/><br/>Notes: ${parsed.data.notes}` : ""}`,
      }),
    });
  }

  revalidatePath("/consultations");
  return { ok: true };
}
