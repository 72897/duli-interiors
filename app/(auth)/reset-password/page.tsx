import type { Metadata } from "next";
import { PasswordResetForm } from "@/components/password-reset-form";

export const metadata: Metadata = { title: "New password — Duli Interiors" };

/**
 * Landing page for the emailed reset link. By the time a user reaches here,
 * /auth/callback has exchanged the code for a recovery session, so we render
 * the form unconditionally — the session is exactly what makes updateUser work.
 */
export default function ResetPasswordPage() {
  return <PasswordResetForm mode="reset" />;
}
