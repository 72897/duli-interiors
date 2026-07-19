"use client";

import { useState, useTransition } from "react";
import { setUserVendor } from "@/lib/account/actions";

/**
 * Admin control to link a user to a vendor organisation. Only meaningful for
 * vendor-role users; shown on the admin users table.
 */
export function UserVendorLink({
  userId,
  current,
  vendors,
}: {
  userId: string;
  current: string | null;
  vendors: { id: string; name: string }[];
}) {
  const [value, setValue] = useState(current ?? "");
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const onChange = (v: string) => {
    setValue(v);
    setSaved(false);
    startTransition(async () => {
      const res = await setUserVendor(userId, v || null);
      if (res?.ok) setSaved(true);
    });
  };

  return (
    <div className="flex items-center gap-1.5">
      <select
        value={value}
        disabled={pending}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 max-w-[150px] rounded-lg border border-ink/10 bg-white/70 px-2 text-[12px] focus:border-olive focus:outline-none"
      >
        <option value="">No vendor org</option>
        {vendors.map((v) => (
          <option key={v.id} value={v.id}>
            {v.name}
          </option>
        ))}
      </select>
      {saved && <span className="text-[11px] text-olive">✓</span>}
    </div>
  );
}
