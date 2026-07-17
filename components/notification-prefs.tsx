"use client";

import { useState, useTransition } from "react";
import { updateNotificationPrefs } from "@/lib/account/actions";

function Toggle({
  label,
  hint,
  on,
  onToggle,
  pending,
}: {
  label: string;
  hint: string;
  on: boolean;
  onToggle: () => void;
  pending: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-4">
      <div>
        <p className="text-[14px] font-medium">{label}</p>
        <p className="mt-0.5 text-[12.5px] text-muted">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        disabled={pending}
        onClick={onToggle}
        className={
          "mt-0.5 grid h-6 w-11 shrink-0 cursor-pointer items-center rounded-full px-0.5 transition-colors disabled:opacity-60 " +
          (on ? "bg-olive" : "bg-ink/15")
        }
      >
        <span
          className={
            "h-5 w-5 rounded-full bg-white shadow-sm transition-transform " +
            (on ? "translate-x-5" : "translate-x-0")
          }
        />
      </button>
    </div>
  );
}

export function NotificationPrefs({
  defaults,
}: {
  defaults: { email: boolean; whatsapp: boolean };
}) {
  const [email, setEmail] = useState(defaults.email);
  const [whatsapp, setWhatsapp] = useState(defaults.whatsapp);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const save = (next: { email: boolean; whatsapp: boolean }) =>
    startTransition(async () => {
      setSaved(false);
      const res = await updateNotificationPrefs(next);
      if (res?.ok) setSaved(true);
    });

  const toggleEmail = () => {
    const v = !email;
    setEmail(v);
    save({ email: v, whatsapp });
  };
  const toggleWhatsapp = () => {
    const v = !whatsapp;
    setWhatsapp(v);
    save({ email, whatsapp: v });
  };

  return (
    <div>
      <div className="divide-y divide-ink/[0.07]">
        <Toggle
          label="Email updates"
          hint="Design concepts, estimates and project milestones by email."
          on={email}
          onToggle={toggleEmail}
          pending={pending}
        />
        <Toggle
          label="WhatsApp updates"
          hint="Time-sensitive updates on WhatsApp — common in India."
          on={whatsapp}
          onToggle={toggleWhatsapp}
          pending={pending}
        />
      </div>
      {saved && (
        <p className="px-5 py-2 text-[12px] text-olive" role="status">
          Saved.
        </p>
      )}
    </div>
  );
}
