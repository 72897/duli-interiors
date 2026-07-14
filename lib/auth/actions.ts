"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type AuthState,
} from "@/lib/auth/schema";

const NOT_CONFIGURED =
  "Sign-in isn't connected yet. Add Supabase credentials to enable accounts.";

function siteUrl() {
  const h = headers();
  const origin =
    h.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";
  return origin;
}

/** Email + password sign-in. Authoritative validation happens here. */
export async function signIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: NOT_CONFIGURED };

  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: error.message };

  const redirectTo = String(formData.get("redirect") || "/dashboard");
  redirect(redirectTo);
}

/** Email + password registration with a profile full_name in metadata. */
export async function signUp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role") ?? "customer",
    phone: formData.get("phone") ?? "",
    city: formData.get("city") ?? "",
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: NOT_CONFIGURED };

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      // The signup trigger (0012) reads these to set the profile + role. The
      // DB validates the role, so only self-serve roles ever take effect.
      data: {
        full_name: parsed.data.fullName,
        requested_role: parsed.data.role,
        phone: parsed.data.phone || "",
        city: parsed.data.city || "",
      },
      emailRedirectTo: `${siteUrl()}/auth/callback`,
    },
  });
  if (error) return { error: error.message };

  return {
    ok: true,
    error: undefined,
  };
}

/** Google OAuth — returns a redirect URL for the client to follow. */
export async function signInWithGoogle(): Promise<AuthState> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: NOT_CONFIGURED };

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${siteUrl()}/auth/callback` },
  });
  if (error) return { error: error.message };
  if (data.url) redirect(data.url);
  return {};
}

/**
 * Sends a password-reset email. Always reports success even when the address
 * has no account — telling a stranger whether an email is registered is an
 * account-enumeration leak. The reset link lands on /reset-password.
 */
export async function requestPasswordReset(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: NOT_CONFIGURED };

  // Route through /auth/callback so the emailed code is exchanged into a
  // session cookie (PKCE) before landing on the form — /reset-password needs
  // that recovery session for updateUser to work.
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl()}/auth/callback?redirect=/reset-password`,
  });

  // Deliberately unconditional — see the enumeration note above.
  return { ok: true };
}

/**
 * Sets a new password. Only works inside the recovery session Supabase
 * establishes when the user arrives via the emailed link; without it,
 * updateUser has no authenticated user and fails.
 */
export async function resetPassword(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: NOT_CONFIGURED };

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) return { error: error.message };

  return { ok: true };
}

export async function signOut() {
  if (!isSupabaseConfigured) redirect("/");
  const supabase = createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/");
}
