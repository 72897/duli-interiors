"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Phone, Video, Home as HomeIcon } from "lucide-react";
import {
  requestConsultation,
  type ConsultationState,
} from "@/lib/collaboration/actions";
import { CITIES } from "@/lib/types";

const initial: ConsultationState = {};

const fieldCls =
  "h-11 w-full rounded-xl border border-ink/10 bg-white/70 px-3.5 text-[13.5px] text-ink focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/20";

const MODES = [
  { value: "call", label: "Phone call", icon: Phone },
  { value: "video", label: "Video call", icon: Video },
  { value: "site_visit", label: "Site visit", icon: HomeIcon },
] as const;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-solid h-11 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Requesting…" : "Request consultation"}
      <span aria-hidden="true">→</span>
    </button>
  );
}

export function ConsultationForm({
  projects,
}: {
  projects: { id: string; name: string }[];
}) {
  const [state, formAction] = useFormState(requestConsultation, initial);
  const formRef = useRef<HTMLFormElement>(null);
  const err = (f: string) => state.fieldErrors?.[f]?.[0];

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  // Default the picker to tomorrow 10:00, and set a min of now.
  const now = new Date();
  const minAttr = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  if (state.ok) {
    return (
      <div className="rounded-xl border border-olive/30 bg-olive/[0.07] px-4 py-3.5 text-[13px] text-ink">
        Request sent — a Duli designer will confirm a time with you shortly.
        You&apos;ll see it below once it&apos;s scheduled.
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {state.error && (
        <p className="rounded-lg border border-terracotta/40 bg-terracotta/[0.08] px-3 py-2 text-[12.5px] text-terracotta" role="alert">
          {state.error}
        </p>
      )}

      {/* Mode — radio pills */}
      <div>
        <p className="mb-1.5 text-[12.5px] font-medium">How would you like to meet?</p>
        <div className="flex flex-wrap gap-2">
          {MODES.map((m, i) => {
            const Icon = m.icon;
            return (
              <label
                key={m.value}
                className="relative flex cursor-pointer items-center gap-2 rounded-full border border-ink/10 bg-white/60 px-3.5 py-2 text-[12.5px] transition-colors duration-200 has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-bg"
              >
                {/* Visually hidden but kept IN PLACE (absolute within this
                    relative label) — a plain sr-only radio positions near the
                    page top, so focusing it on click scrolled the page up. */}
                <input
                  type="radio"
                  name="mode"
                  value={m.value}
                  defaultChecked={i === 0}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
                <Icon size={14} strokeWidth={1.9} />
                {m.label}
              </label>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="scheduledAt" className="mb-1.5 block text-[12.5px] font-medium">
            Preferred date &amp; time
          </label>
          <input
            id="scheduledAt"
            name="scheduledAt"
            type="datetime-local"
            min={minAttr}
            required
            className={fieldCls}
            aria-invalid={!!err("scheduledAt")}
          />
          {err("scheduledAt") && (
            <p className="mt-1 text-[12px] text-terracotta">{err("scheduledAt")}</p>
          )}
        </div>

        <div>
          <label htmlFor="city" className="mb-1.5 block text-[12.5px] font-medium">
            City
          </label>
          <select id="city" name="city" required className={fieldCls} defaultValue="">
            <option value="" disabled>
              Select a city
            </option>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {err("city") && (
            <p className="mt-1 text-[12px] text-terracotta">{err("city")}</p>
          )}
        </div>
      </div>

      {projects.length > 0 && (
        <div>
          <label htmlFor="projectId" className="mb-1.5 block text-[12.5px] font-medium">
            Project <span className="text-muted">(optional)</span>
          </label>
          <select id="projectId" name="projectId" className={fieldCls} defaultValue="">
            <option value="">Not about a specific project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="notes" className="mb-1.5 block text-[12.5px] font-medium">
          Anything to add? <span className="text-muted">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          maxLength={1000}
          placeholder="What you'd like to discuss…"
          className="w-full resize-none rounded-xl border border-ink/10 bg-white/70 px-3.5 py-2.5 text-[13px] text-ink placeholder:text-muted focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/20"
        />
      </div>

      <SubmitButton />
    </form>
  );
}
