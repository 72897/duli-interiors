"use client";

import { useFormState, useFormStatus } from "react-dom";
import { requestPasswordReset, resetPassword } from "@/lib/auth/actions";
import type { AuthState } from "@/lib/auth/schema";

const initial: AuthState = {};

const inputCls =
  "h-[46px] w-full rounded-[9px] border border-stone bg-bg px-3.5 text-sm text-ink transition-colors duration-200 placeholder:text-muted focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/20 aria-[invalid=true]:border-terracotta";

const cardCls =
  "w-full max-w-[430px] rounded-[14px] border border-stone bg-surface p-7 shadow-card sm:p-10";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn-solid mt-1 h-12 w-full justify-center"
      disabled={pending}
    >
      {pending ? "Please wait…" : label}
      <span aria-hidden="true">→</span>
    </button>
  );
}

export function PasswordResetForm({ mode }: { mode: "forgot" | "reset" }) {
  const isForgot = mode === "forgot";
  const [state, formAction] = useFormState(
    isForgot ? requestPasswordReset : resetPassword,
    initial,
  );
  const fieldError = (name: string) => state.fieldErrors?.[name]?.[0];

  // Success states diverge: "check your inbox" vs. "password changed".
  if (state.ok && isForgot) {
    return (
      <div className={cardCls}>
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-brass">
          Reset link sent
        </p>
        <h1 className="font-serif text-[28px] leading-tight sm:text-[32px]">
          Check your inbox
        </h1>
        <p className="mt-2.5 text-sm text-muted">
          If an account exists for that email, we&apos;ve sent a link to reset
          your password. It expires shortly, so use it soon.
        </p>
        <a
          href="/login"
          className="mt-6 inline-block text-[13.5px] text-olive underline underline-offset-2"
        >
          Back to sign in
        </a>
      </div>
    );
  }

  if (state.ok && !isForgot) {
    return (
      <div className={cardCls}>
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-brass">
          All set
        </p>
        <h1 className="font-serif text-[28px] leading-tight sm:text-[32px]">
          Password updated
        </h1>
        <p className="mt-2.5 text-sm text-muted">
          Your password has been changed. You can sign in with it now.
        </p>
        <a href="/login" className="btn-solid mt-6 inline-flex h-11">
          Sign in <span aria-hidden="true">→</span>
        </a>
      </div>
    );
  }

  return (
    <div className={cardCls}>
      <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-brass">
        {isForgot ? "Forgot your password?" : "Choose a new password"}
      </p>
      <h1 className="font-serif text-[28px] leading-tight sm:text-[32px]">
        {isForgot ? "Reset password" : "Set a new password"}
      </h1>
      <p className="mt-2.5 text-sm text-muted">
        {isForgot
          ? "Enter your email and we'll send a link to set a new one."
          : "Enter a new password for your account."}
      </p>

      {state.error && (
        <div
          className="mt-[18px] rounded-lg border border-terracotta/40 bg-terracotta/[0.08] px-3 py-2.5 text-[13px] text-terracotta"
          role="alert"
        >
          {state.error}
        </div>
      )}

      <form className="mt-6 flex flex-col gap-4" action={formAction} noValidate>
        {isForgot ? (
          <div>
            <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className={inputCls}
              aria-invalid={!!fieldError("email")}
            />
            {fieldError("email") && (
              <p className="mt-1.5 text-xs text-terracotta">{fieldError("email")}</p>
            )}
          </div>
        ) : (
          <div>
            <label htmlFor="password" className="mb-1.5 block text-[13px] font-medium">
              New password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              className={inputCls}
              aria-invalid={!!fieldError("password")}
            />
            {fieldError("password") && (
              <p className="mt-1.5 text-xs text-terracotta">
                {fieldError("password")}
              </p>
            )}
          </div>
        )}

        <SubmitButton label={isForgot ? "Send reset link" : "Update password"} />
      </form>

      {isForgot && (
        <p className="mt-[22px] text-center text-[13.5px] text-muted">
          Remembered it?{" "}
          <a href="/login" className="text-olive underline underline-offset-2">
            Sign in
          </a>
        </p>
      )}
    </div>
  );
}
