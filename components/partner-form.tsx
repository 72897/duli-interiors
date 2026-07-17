"use client";

import { useFormState, useFormStatus } from "react-dom";
import { submitPartnerApplication } from "@/lib/partners/actions";
import type { PartnerFormState } from "@/lib/partners/schema";
import { PROGRAMS, type ProgramId } from "@/lib/partners/programs";

const CITIES = [
  "Delhi",
  "Mumbai",
  "Pune",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Gurugram",
  "Ahmedabad",
  "Kolkata",
  "Jaipur",
  "Other",
];

const initial: PartnerFormState = {};

const field =
  "h-11 w-full rounded-[9px] border border-stone bg-bg px-3 text-sm text-ink transition-colors duration-200 focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/20 aria-[invalid=true]:border-terracotta";
const labelCls = "mb-1.5 block text-[13px] font-medium";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-solid mt-2 h-12 w-full justify-center" disabled={pending}>
      {pending ? "Sending…" : "Submit application"}
      <span aria-hidden="true">→</span>
    </button>
  );
}

export function PartnerForm({ defaultProgram }: { defaultProgram?: ProgramId }) {
  const [state, formAction] = useFormState(submitPartnerApplication, initial);
  const err = (n: string) => state.fieldErrors?.[n]?.[0];

  if (state.ok) {
    return (
      <div
        className="rounded-xl border border-success/40 bg-success/10 p-6"
        role="status"
      >
        <p className="font-semibold text-ink">Application received.</p>
        <p className="mt-2 text-sm text-muted">
          Thanks — our partnerships team will review it and get in touch. For
          anything urgent, email{" "}
          <a className="text-olive underline" href="mailto:info@duliinteriors.com">
            info@duliinteriors.com
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="space-y-4">
      {state.error && (
        <div
          className="rounded-lg border border-terracotta/40 bg-terracotta/[0.08] px-3 py-2.5 text-[13px] text-terracotta"
          role="alert"
        >
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="program" className={labelCls}>
          Programme
        </label>
        <select
          id="program"
          name="program"
          defaultValue={defaultProgram ?? "execution"}
          className={field}
          aria-invalid={!!err("program")}
        >
          {PROGRAMS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {err("program") && <p className="mt-1.5 text-xs text-terracotta">{err("program")}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="full_name" className={labelCls}>Full name</label>
          <input id="full_name" name="full_name" className={field} aria-invalid={!!err("full_name")} />
          {err("full_name") && <p className="mt-1.5 text-xs text-terracotta">{err("full_name")}</p>}
        </div>
        <div>
          <label htmlFor="phone" className={labelCls}>Phone</label>
          <input id="phone" name="phone" inputMode="tel" className={field} aria-invalid={!!err("phone")} />
          {err("phone") && <p className="mt-1.5 text-xs text-terracotta">{err("phone")}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className={labelCls}>Email</label>
          <input id="email" name="email" type="email" className={field} aria-invalid={!!err("email")} />
          {err("email") && <p className="mt-1.5 text-xs text-terracotta">{err("email")}</p>}
        </div>
        <div>
          <label htmlFor="city" className={labelCls}>City</label>
          <select id="city" name="city" defaultValue="" className={field} aria-invalid={!!err("city")}>
            <option value="" disabled>Select your city</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {err("city") && <p className="mt-1.5 text-xs text-terracotta">{err("city")}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="company" className={labelCls}>
            Company / firm <span className="text-muted">(optional)</span>
          </label>
          <input id="company" name="company" className={field} />
        </div>
        <div>
          <label htmlFor="experience_years" className={labelCls}>
            Years of experience <span className="text-muted">(optional)</span>
          </label>
          <input id="experience_years" name="experience_years" inputMode="numeric" maxLength={2} className={field} aria-invalid={!!err("experience_years")} />
          {err("experience_years") && <p className="mt-1.5 text-xs text-terracotta">{err("experience_years")}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="website" className={labelCls}>
          Website or portfolio <span className="text-muted">(optional)</span>
        </label>
        <input id="website" name="website" className={field} placeholder="duliinteriors.com" />
      </div>

      <div>
        <label htmlFor="message" className={labelCls}>
          Tell us about your work <span className="text-muted">(optional)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="w-full rounded-[9px] border border-stone bg-bg p-3 text-sm text-ink transition-colors duration-200 focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/20"
        />
      </div>

      <Submit />
      <p className="text-xs text-muted">
        We review every application and reply by email. Your details are only
        used to assess this application.
      </p>
    </form>
  );
}
