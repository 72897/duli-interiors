"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Sub-nav for the vendor portal. Gating happens once in the vendor layout;
 * this is wayfinding within it.
 */
const TABS = [
  { href: "/vendor", label: "Dashboard", exact: true },
  { href: "/vendor/catalog", label: "My SKUs" },
  { href: "/vendor/products/new", label: "Add product" },
  { href: "/vendor/leads", label: "Leads" },
  { href: "/vendor/profile", label: "Profile" },
];

export function VendorNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Vendor portal"
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
