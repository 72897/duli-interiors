"use client";

import { useEffect, useRef, useState } from "react";
import { signOut } from "@/lib/auth/actions";

export function AccountMenu({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const initial = (name || email || "?").charAt(0).toUpperCase();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-olive text-sm font-semibold text-bg transition-opacity duration-200 hover:opacity-90"
      >
        {initial}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-11 z-30 w-[280px] overflow-hidden rounded-xl border border-stone bg-surface shadow-card"
        >
          <div className="flex items-center gap-3 border-b border-stone p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-olive text-sm font-semibold text-bg">
              {initial}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{name}</p>
              <p className="truncate text-xs text-muted">{email}</p>
            </div>
          </div>

          <div className="p-1.5">
            <a role="menuitem" href="/projects" className="block rounded-lg px-3 py-2 text-[13.5px] transition-colors duration-200 hover:bg-ink/[0.06]">
              My projects
            </a>
            <a role="menuitem" href="/settings" className="block rounded-lg px-3 py-2 text-[13.5px] transition-colors duration-200 hover:bg-ink/[0.06]">
              Account settings
            </a>
            <a role="menuitem" href="/pricing" className="block rounded-lg px-3 py-2 text-[13.5px] transition-colors duration-200 hover:bg-ink/[0.06]">
              Plans &amp; pricing
            </a>
          </div>

          <form action={signOut} className="border-t border-stone p-1.5">
            <button
              type="submit"
              role="menuitem"
              className="w-full cursor-pointer rounded-lg px-3 py-2 text-left text-[13.5px] text-terracotta transition-colors duration-200 hover:bg-terracotta/[0.08]"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
