"use client";

import { useState, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { signIn, signUp, signInWithGoogle } from "@/lib/auth/actions";
import { SIGNUP_ROLES, type AuthState } from "@/lib/auth/schema";
import { CITIES } from "@/lib/types";

const initial: AuthState = {};

const inputCls =
  "h-[46px] w-full rounded-[9px] border border-stone bg-bg px-3.5 text-sm text-ink transition-colors duration-200 placeholder:text-muted focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/20 aria-[invalid=true]:border-terracotta";

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

export function AuthForm({
  mode,
  redirectTo,
}: {
  mode: "login" | "register";
  redirectTo?: string;
}) {
  const isRegister = mode === "register";
  const [state, formAction] = useFormState(
    isRegister ? signUp : signIn,
    initial,
  );
  const [googleErr, setGoogleErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const fieldError = (name: string) => state.fieldErrors?.[name]?.[0];

  const onGoogle = () =>
    startTransition(async () => {
      const res = await signInWithGoogle();
      if (res?.error) setGoogleErr(res.error);
    });

  const cardCls =
    "w-full max-w-[430px] rounded-[14px] border border-stone bg-surface p-7 shadow-card sm:p-10";

  if (isRegister && state.ok) {
    return (
      <div className={cardCls}>
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-brass">
          Welcome to Duli
        </p>
        <h1 className="font-serif text-[28px] leading-tight sm:text-[32px]">
          Check your inbox
        </h1>
        <p className="mt-2.5 text-sm text-muted">
          We’ve sent a confirmation link to verify your email. Once confirmed,
          you can sign in and start your project.
        </p>
      </div>
    );
  }

  return (
    <div className={cardCls}>
      <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-brass">
        {isRegister ? "Create your account" : "Welcome back"}
      </p>
      <h1 className="font-serif text-[28px] leading-tight sm:text-[32px]">
        {isRegister ? "Start your project" : "Sign in"}
      </h1>
      <p className="mt-2.5 text-sm text-muted">
        {isRegister
          ? "Create an account to share your rooms and receive reviewed concepts."
          : "Access your projects, concepts and proposals."}
      </p>

      {(state.error || googleErr) && (
        <div
          className="mt-[18px] rounded-lg border border-terracotta/40 bg-terracotta/[0.08] px-3 py-2.5 text-[13px] text-terracotta"
          role="alert"
        >
          {state.error || googleErr}
        </div>
      )}

      <form className="mt-6 flex flex-col gap-4" action={formAction} noValidate>
        {redirectTo ? (
          <input type="hidden" name="redirect" value={redirectTo} />
        ) : null}

        {isRegister && (
          <>
            <div>
              <label htmlFor="fullName" className="mb-1.5 block text-[13px] font-medium">
                Full name
              </label>
              <input
                id="fullName"
                name="fullName"
                autoComplete="name"
                className={inputCls}
                aria-invalid={!!fieldError("fullName")}
              />
              {fieldError("fullName") && (
                <p className="mt-1.5 text-xs text-terracotta">
                  {fieldError("fullName")}
                </p>
              )}
            </div>

            {/* Role — what brings you to Duli. Staff roles are granted by an
                admin, never chosen here. */}
            <div>
              <span className="mb-1.5 block text-[13px] font-medium">I&apos;m a…</span>
              <div className="grid grid-cols-2 gap-2">
                {SIGNUP_ROLES.map((r, i) => (
                  <label
                    key={r.value}
                    className="flex cursor-pointer flex-col rounded-[9px] border border-stone bg-bg px-3 py-2 transition-colors duration-200 has-[:checked]:border-olive has-[:checked]:bg-olive/[0.06]"
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="role"
                        value={r.value}
                        defaultChecked={i === 0}
                        className="accent-olive"
                      />
                      <span className="text-[13px] font-medium">{r.label}</span>
                    </span>
                    <span className="mt-0.5 pl-6 text-[11px] text-muted">{r.hint}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="phone" className="mb-1.5 block text-[13px] font-medium">
                  Phone <span className="text-muted">(optional)</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+91…"
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="city" className="mb-1.5 block text-[13px] font-medium">
                  City <span className="text-muted">(optional)</span>
                </label>
                <input
                  id="city"
                  name="city"
                  list="signup-cities"
                  className={inputCls}
                />
                <datalist id="signup-cities">
                  {CITIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
            </div>
          </>
        )}

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
            <p className="mt-1.5 text-xs text-terracotta">
              {fieldError("email")}
            </p>
          )}
        </div>

        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <label htmlFor="password" className="block text-[13px] font-medium">
              Password
            </label>
            {!isRegister && (
              <a
                href="/forgot-password"
                className="text-[12px] text-olive underline underline-offset-2"
              >
                Forgot password?
              </a>
            )}
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            className={inputCls}
            aria-invalid={!!fieldError("password")}
          />
          {fieldError("password") && (
            <p className="mt-1.5 text-xs text-terracotta">
              {fieldError("password")}
            </p>
          )}
        </div>

        <SubmitButton label={isRegister ? "Create account" : "Sign in"} />
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-muted before:h-px before:flex-1 before:bg-stone after:h-px after:flex-1 after:bg-stone">
        or
      </div>

      <button
        type="button"
        className="flex h-12 w-full cursor-pointer items-center justify-center gap-2.5 rounded-full border border-stone bg-surface text-sm font-medium transition-[border-color,transform] duration-200 hover:-translate-y-px hover:border-olive disabled:cursor-not-allowed disabled:opacity-60"
        onClick={onGoogle}
        disabled={pending}
      >
        <GoogleMark />
        {pending ? "Redirecting…" : "Continue with Google"}
      </button>

      <p className="mt-[22px] text-center text-[13.5px] text-muted">
        {isRegister ? (
          <>
            Already have an account?{" "}
            <a href="/login" className="text-olive underline underline-offset-2">
              Sign in
            </a>
          </>
        ) : (
          <>
            New to Duli?{" "}
            <a href="/register" className="text-olive underline underline-offset-2">
              Create an account
            </a>
          </>
        )}
      </p>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.7 30.2 0 24 0 14.6 0 6.4 5.4 2.5 13.2l7.9 6.1C12.3 13.2 17.6 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.5 2.9-2.1 5.4-4.6 7.1l7.2 5.6c4.2-3.9 6.7-9.6 6.7-17.2z" />
      <path fill="#FBBC05" d="M10.4 28.7c-.5-1.4-.8-2.9-.8-4.7s.3-3.3.8-4.7l-7.9-6.1C.9 16.3 0 20 0 24s.9 7.7 2.5 10.8l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.2-5.6c-2 1.4-4.6 2.2-8 2.2-6.4 0-11.7-3.7-13.6-9.1l-7.9 6.1C6.4 42.6 14.6 48 24 48z" />
    </svg>
  );
}
