"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateProfile, type ProfileState } from "@/lib/account/actions";
import { CITIES } from "@/lib/types";

const initial: ProfileState = {};

const fieldCls =
  "h-11 w-full rounded-xl border border-ink/10 bg-white/70 px-3.5 text-[13.5px] text-ink placeholder:text-muted focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/20 aria-[invalid=true]:border-terracotta";

const CONTACT = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone call" },
  { value: "whatsapp", label: "WhatsApp" },
] as const;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-solid h-11 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save changes"}
    </button>
  );
}

export function ProfileForm({
  defaults,
}: {
  defaults: {
    fullName: string;
    phone: string;
    city: string;
    preferredContact: string;
  };
}) {
  const [state, formAction] = useFormState(updateProfile, initial);
  const err = (f: string) => state.fieldErrors?.[f]?.[0];

  return (
    <form action={formAction} className="max-w-[560px] space-y-4">
      {state.ok && (
        <p className="rounded-lg border border-olive/30 bg-olive/[0.07] px-3 py-2 text-[12.5px] text-ink" role="status">
          Saved.
        </p>
      )}
      {state.error && (
        <p className="rounded-lg border border-terracotta/40 bg-terracotta/[0.08] px-3 py-2 text-[12.5px] text-terracotta" role="alert">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="fullName" className="mb-1.5 block text-[12.5px] font-medium">
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          defaultValue={defaults.fullName}
          autoComplete="name"
          className={fieldCls}
          aria-invalid={!!err("fullName")}
        />
        {err("fullName") && (
          <p className="mt-1 text-[12px] text-terracotta">{err("fullName")}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="mb-1.5 block text-[12.5px] font-medium">
            Phone <span className="text-muted">(optional)</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={defaults.phone}
            autoComplete="tel"
            placeholder="+91…"
            className={fieldCls}
          />
        </div>

        <div>
          <label htmlFor="city" className="mb-1.5 block text-[12.5px] font-medium">
            City <span className="text-muted">(optional)</span>
          </label>
          <input
            id="city"
            name="city"
            list="city-options"
            defaultValue={defaults.city}
            placeholder="Where's your home?"
            className={fieldCls}
          />
          <datalist id="city-options">
            {CITIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
      </div>

      <div>
        <label htmlFor="preferredContact" className="mb-1.5 block text-[12.5px] font-medium">
          Preferred contact
        </label>
        <select
          id="preferredContact"
          name="preferredContact"
          defaultValue={defaults.preferredContact || "email"}
          className={fieldCls}
        >
          {CONTACT.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <SubmitButton />
    </form>
  );
}
