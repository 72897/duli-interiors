"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Sparkles,
  Ruler,
  Box,
  Library,
  ReceiptIndianRupee,
  CalendarDays,
  Bell,
  User,
  Settings,
  ShieldCheck,
  Store,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";

/**
 * Navigation for the authenticated app.
 *
 * Role-gated links are filtered on the server and passed in as `show*` flags.
 * That is presentation only — /admin and /vendor re-check the role themselves
 * and RLS scopes every query, so a hidden link is convenience, never the
 * security boundary.
 */

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

const MAIN: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/projects", label: "Projects", icon: FolderKanban },
];

const DESIGN: NavItem[] = [
  { href: "/ai-studio", label: "AI Studio", icon: Sparkles },
  { href: "/floor-planner", label: "Floor Planner", icon: Ruler },
  { href: "/3d-studio", label: "3D Studio", icon: Box },
];

const SOURCING: NavItem[] = [
  { href: "/catalog", label: "Catalog", icon: Library },
  { href: "/estimates", label: "Estimates", icon: ReceiptIndianRupee },
  { href: "/consultations", label: "Consultations", icon: CalendarDays },
];

const ACCOUNT: NavItem[] = [
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

function isActive(pathname: string, item: NavItem) {
  return item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(item.href + "/");
}

function NavLink({
  item,
  pathname,
  onNavigate,
  tone = "default",
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
  tone?: "default" | "brass";
}) {
  const active = isActive(pathname, item);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={
        "group relative flex cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14px] font-semibold transition-colors duration-200 " +
        (active
          ? "bg-ink text-bg shadow-[0_10px_24px_-14px_rgba(31,31,31,0.9)]"
          : tone === "brass"
            ? "text-brass hover:bg-brass/10"
            : "text-ink/75 hover:bg-ink/[0.06] hover:text-ink")
      }
    >
      <Icon
        size={18}
        strokeWidth={2}
        className={active ? "text-brass" : "opacity-70"}
      />
      {item.label}
    </Link>
  );
}

function Section({
  title,
  items,
  pathname,
  onNavigate,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="mb-5">
      <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted/70">
        {title}
      </p>
      <div className="space-y-0.5">
        {items.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  );
}

export function AppSidebar({
  showAdmin = false,
  showVendor = false,
  roleLabel,
}: {
  showAdmin?: boolean;
  showVendor?: boolean;
  roleLabel?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const nav = (
    <>
      <Section title="Overview" items={MAIN} pathname={pathname} onNavigate={close} />
      <Section title="Design" items={DESIGN} pathname={pathname} onNavigate={close} />
      <Section title="Sourcing" items={SOURCING} pathname={pathname} onNavigate={close} />
      <Section title="Account" items={ACCOUNT} pathname={pathname} onNavigate={close} />

      {(showAdmin || showVendor) && (
        <div className="mt-auto border-t border-ink/[0.08] pt-4">
          <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-brass/80">
            {roleLabel ?? "Staff"}
          </p>
          <div className="space-y-0.5">
            {showAdmin && (
              <NavLink
                item={{ href: "/admin", label: "Admin", icon: ShieldCheck }}
                pathname={pathname}
                onNavigate={close}
                tone="brass"
              />
            )}
            {showVendor && (
              <NavLink
                item={{ href: "/vendor", label: "Vendor Portal", icon: Store }}
                pathname={pathname}
                onNavigate={close}
                tone="brass"
              />
            )}
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile trigger — the sidebar is off-canvas below lg */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        className="fixed left-4 top-24 z-40 grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-white/60 bg-white/85 text-ink shadow-[0_10px_30px_-12px_rgba(31,31,31,0.5)] backdrop-blur-xl lg:hidden"
      >
        <Menu size={18} strokeWidth={2} />
      </button>

      {/* Desktop rail — natural height so every link is always visible (never
          clipped), sticky so it stays put while the page scrolls beside it. A
          min-height keeps it looking like a full panel on short menus. */}
      <aside className="sticky top-24 hidden w-[248px] shrink-0 self-start lg:block">
        <nav
          aria-label="App"
          className="flex min-h-[calc(100vh-7rem)] flex-col rounded-[22px] border border-white/60 bg-white/75 p-4 backdrop-blur-xl"
        >
          {nav}
        </nav>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={close}
            aria-hidden
          />
          <nav
            aria-label="App"
            className="absolute left-0 top-0 flex h-full w-[268px] flex-col overflow-y-auto border-r border-white/60 bg-bg p-3 pt-5"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close navigation"
              className="mb-3 ml-auto grid h-9 w-9 cursor-pointer place-items-center rounded-full text-ink hover:bg-ink/[0.06]"
            >
              <X size={17} strokeWidth={2} />
            </button>
            {nav}
          </nav>
        </div>
      )}
    </>
  );
}
