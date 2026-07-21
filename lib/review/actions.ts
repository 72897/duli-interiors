"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMyRoles, isStaffRole } from "@/lib/services";
import { sendEmail, brandedEmail, teamInbox } from "@/lib/email/resend";
import { logActivity } from "@/lib/activity/log";

export type ReviewState = { ok?: boolean; error?: string };

const siteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/**
 * Customer submits a project for review. Moves it to 'submitted' and pings the
 * reviewers (designers/admins) via the notify_reviewers RPC. RLS lets the owner
 * update their own project; the RPC checks project access before notifying.
 */
export async function submitProjectForReview(
  projectId: string,
): Promise<ReviewState> {
  if (!z.string().uuid().safeParse(projectId).success) {
    return { error: "Invalid project." };
  }
  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "Not available." };

  const { data: project } = await supabase
    .from("projects")
    .select("id, name")
    .eq("id", projectId)
    .maybeSingle();
  if (!project) return { error: "Project not found." };

  const { error } = await supabase
    .from("projects")
    .update({ status: "submitted" })
    .eq("id", projectId);
  if (error) return { error: error.message };

  await supabase.rpc("notify_reviewers", {
    p_project_id: projectId,
    p_type: "review_needed",
    p_title: "New project submitted for review",
    p_body: `"${project.name}" is ready for a designer to review.`,
    p_action_url: `/admin/review`,
  });

  // Real email alert to the Duli team — this is how the admin knows off-app.
  const inbox = teamInbox();
  if (inbox) {
    await sendEmail({
      to: inbox,
      subject: `New project submitted — ${project.name}`,
      html: brandedEmail({
        heading: "A customer submitted a project for review",
        bodyHtml: `<strong>${project.name}</strong> is ready for a designer to pick up in the review queue.`,
        ctaText: "Open the review queue",
        ctaUrl: `${siteUrl()}/admin/review`,
      }),
    });
  }

  await logActivity(supabase, projectId, "Submitted the project for review");

  revalidatePath("/admin/review");
  revalidatePath(`/projects/${projectId}`);
  return { ok: true };
}

const analysisDecision = z.object({
  analysisId: z.string().uuid(),
  decision: z.enum(["confirmed", "needs_correction"]),
  notes: z.string().trim().max(1000).optional(),
});

/**
 * Designer/admin reviews an AI analysis — confirm it (customer may see it) or
 * flag it for correction. Stamps reviewer + notes and notifies the customer.
 * Staff-only; RLS on ai_analyses (can_access_project) already scopes writes.
 */
export async function reviewAnalysis(
  analysisId: string,
  decision: "confirmed" | "needs_correction",
  notes?: string,
): Promise<ReviewState> {
  const parsed = analysisDecision.safeParse({ analysisId, decision, notes });
  if (!parsed.success) return { error: "Invalid review." };

  const roles = await getMyRoles();
  if (!isStaffRole(roles)) return { error: "Reviewers only." };

  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "Not available." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in." };

  // Find the analysis's project + owner so we can notify the right customer.
  const { data: analysis } = await supabase
    .from("ai_analyses")
    .select("id, project_id, projects(name, customer_id)")
    .eq("id", analysisId)
    .maybeSingle();
  if (!analysis) return { error: "Analysis not found." };

  const { error } = await supabase
    .from("ai_analyses")
    .update({
      review_status: parsed.data.decision,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      designer_notes: parsed.data.notes ?? null,
    })
    .eq("id", analysisId);
  if (error) return { error: error.message };

  // Supabase types a to-one embed as an array; runtime gives an object. Both.
  const embed = (
    analysis as unknown as {
      projects?:
        | { name: string; customer_id: string }
        | { name: string; customer_id: string }[];
    }
  ).projects;
  const project = Array.isArray(embed) ? embed[0] : embed;
  if (project?.customer_id) {
    const confirmed = parsed.data.decision === "confirmed";
    await supabase.rpc("notify_user", {
      p_user_id: project.customer_id,
      p_type: confirmed ? "design_ready" : "project_update",
      p_title: confirmed
        ? "Your space analysis is confirmed"
        : "Your analysis needs a quick correction",
      p_body: confirmed
        ? `A designer confirmed the analysis for "${project.name}".`
        : `A designer flagged the analysis for "${project.name}" — we'll follow up.`,
      p_action_url: `/projects/${analysis.project_id}/ai-designs`,
    });
  }

  await logActivity(
    supabase,
    analysis.project_id as string,
    parsed.data.decision === "confirmed"
      ? "Confirmed the AI analysis"
      : "Flagged the AI analysis for correction",
  );

  revalidatePath("/admin/review");
  revalidatePath(`/projects/${analysis.project_id}/ai-designs`);
  return { ok: true };
}

const PROJECT_STATUSES = [
  "in_review",
  "concepts_ready",
  "revision_requested",
  "approved",
  "proposal_sent",
] as const;

/**
 * Designer/admin advances a project's stage and notifies the customer. Staff
 * only; project RLS scopes the write.
 */
export async function setProjectStatus(
  projectId: string,
  status: (typeof PROJECT_STATUSES)[number],
): Promise<ReviewState> {
  if (
    !z.string().uuid().safeParse(projectId).success ||
    !PROJECT_STATUSES.includes(status)
  ) {
    return { error: "Invalid request." };
  }
  const roles = await getMyRoles();
  if (!isStaffRole(roles)) return { error: "Reviewers only." };

  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "Not available." };

  const { data: project } = await supabase
    .from("projects")
    .select("id, name, customer_id")
    .eq("id", projectId)
    .maybeSingle();
  if (!project) return { error: "Project not found." };

  const { error } = await supabase
    .from("projects")
    .update({ status })
    .eq("id", projectId);
  if (error) return { error: error.message };

  if (project.customer_id) {
    await supabase.rpc("notify_user", {
      p_user_id: project.customer_id,
      p_type: "project_update",
      p_title: "Your project moved forward",
      p_body: `"${project.name}" is now ${status.replace(/_/g, " ")}.`,
      p_action_url: `/projects/${projectId}`,
    });
  }

  await logActivity(
    supabase,
    projectId,
    `Moved the project to ${status.replace(/_/g, " ")}`,
  );

  revalidatePath("/admin/review");
  revalidatePath(`/projects/${projectId}`);
  return { ok: true };
}
