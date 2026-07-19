"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMyRoles, isAdminRole } from "@/lib/services";

export type ProfileState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

// "" from an optional field → null (cleared), not the empty string.
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : null));

const schema = z.object({
  fullName: z.string().trim().min(1, "Please enter your name.").max(120),
  phone: optionalText(30),
  city: optionalText(80),
  preferredContact: z.enum(["email", "phone", "whatsapp"]),
});

/**
 * Updates the signed-in user's own profile. RLS (`profiles_update_self`,
 * id = auth.uid()) is the real gate — this only writes the row that belongs to
 * the caller, and the update targets that id explicitly as defence in depth.
 */
export async function updateProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const parsed = schema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone") ?? "",
    city: formData.get("city") ?? "",
    preferredContact: formData.get("preferredContact"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "Profiles aren't available right now." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in to edit your profile." };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone,
      city: parsed.data.city,
      preferred_contact_method: parsed.data.preferredContact,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  revalidatePath("/profile");
  return { ok: true };
}

/**
 * Saves notification channel preferences (in-app always shows; these gate
 * email/WhatsApp once a sender is wired). Own profile only via RLS.
 */
export async function updateNotificationPrefs(input: {
  email: boolean;
  whatsapp: boolean;
}): Promise<{ ok?: boolean; error?: string }> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "Not available." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in." };

  const { error } = await supabase
    .from("profiles")
    .update({ notify_email: !!input.email, notify_whatsapp: !!input.whatsapp })
    .eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/settings/notifications");
  return { ok: true };
}

/**
 * Deactivates the caller's own account (soft delete). Sets deleted_at on their
 * own profile row, signs them out, and sends them home. Reversible — an admin
 * can clear the flag. No auth.users row is destroyed, so their projects and
 * history stay intact.
 */
export async function deactivateOwnAccount(): Promise<{ error?: string }> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "Not available right now." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in." };

  const { error } = await supabase
    .from("profiles")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", user.id);
  if (error) return { error: error.message };

  await supabase.auth.signOut();
  redirect("/?deactivated=1");
}

/**
 * Admin links (or unlinks) a user to a vendor organisation. Sets
 * profiles.vendor_id — that link is what scopes the vendor's own SKUs. Admin
 * only (profiles_update_admin RLS); empty vendorId clears it.
 */
export async function setUserVendor(
  userId: string,
  vendorId: string | null,
): Promise<{ ok?: boolean; error?: string }> {
  const roles = await getMyRoles();
  if (!isAdminRole(roles)) return { error: "Admins only." };
  if (!z.string().uuid().safeParse(userId).success) return { error: "Invalid user." };

  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "Not available." };

  const { error } = await supabase
    .from("profiles")
    .update({ vendor_id: vendorId || null })
    .eq("id", userId);
  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  return { ok: true };
}

/**
 * Admin deactivate/reactivate of any user (soft). The DB `profiles_update_admin`
 * policy (is_admin) is the real gate; the role re-check here just yields a clean
 * message. Reversible — `active: true` clears deleted_at.
 */
export async function setUserActive(
  userId: string,
  active: boolean,
): Promise<{ ok?: boolean; error?: string }> {
  const roles = await getMyRoles();
  if (!isAdminRole(roles)) return { error: "Admins only." };

  if (!z.string().uuid().safeParse(userId).success) {
    return { error: "Invalid user." };
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "Not available right now." };

  const { error } = await supabase
    .from("profiles")
    .update({ deleted_at: active ? null : new Date().toISOString() })
    .eq("id", userId);
  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  return { ok: true };
}
