"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/settings", label: "Account", exact: true },
  { href: "/settings/notifications", label: "Notifications" },
  { href: "/settings/billing", label: "Billing" },
  { href: "/settings/integrations", label: "Integrations" },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Settings"
      className="mb-6 flex gap-1 overflow-x-auto rounded-full border border-white/60 bg-white/70 p-2 backdrop-blur-xl"
    >
      {TABS.map((t) => {
        const active = t.exact ? pathname === t.href : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            scroll={false}
            aria-current={active ? "page" : undefined}
            className={
              "shrink-0 cursor-pointer rounded-full px-4 py-2.5 text-[13.5px] font-semibold transition-colors duration-200 " +
              (active
                ? "bg-ink text-bg"
                : "text-ink/75 hover:bg-ink/[0.06] hover:text-ink")
            }
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
