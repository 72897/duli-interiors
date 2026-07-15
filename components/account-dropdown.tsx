"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  LogOut,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { signOut } from "@/lib/auth/actions";
import { getPortalRoot } from "@/lib/portal-root";

type Item = { href: string; label: string; icon: LucideIcon };
type Group = { title: string; items: Item[]; hoverable?: boolean };

const BASE_GROUPS: Group[] = [
  {
    title: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/projects", label: "Projects", icon: FolderKanban },
    ],
  },
  {
    title: "Design",
    hoverable: true,
    items: [
      { href: "/ai-studio", label: "AI Studio", icon: Sparkles },
      { href: "/floor-planner", label: "Floor Planner", icon: Ruler },
      { href: "/3d-studio", label: "3D Studio", icon: Box },
    ],
  },
  {
    title: "Sourcing",
    hoverable: true,
    items: [
      { href: "/catalog", label: "Catalog", icon: Library },
      { href: "/estimates", label: "Estimates", icon: ReceiptIndianRupee },
      { href: "/consultations", label: "Consultations", icon: CalendarDays },
    ],
  },
  {
    title: "Account",
    items: [
      { href: "/notifications", label: "Notifications", icon: Bell },
      { href: "/profile", label: "Profile", icon: User },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

function ItemLink({ item, active }: { item: Item; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      role="menuitem"
      className={
        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors duration-150 " +
        (active
          ? "bg-ink/[0.06] text-ink"
          : "text-ink/80 hover:bg-ink/[0.06] hover:text-ink")
      }
    >
      <Icon size={15} strokeWidth={1.9} className="opacity-70" />
      {item.label}
    </Link>
  );
}

export function AccountDropdown({
  name,
  email,
  avatarUrl,
  roleLabel,
  showAdmin,
  showVendor,
}: {
  name: string;
  email: string;
  avatarUrl: string | null;
  roleLabel?: string;
  showAdmin?: boolean;
  showVendor?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [pos, setPos] = useState<{ top: number; right: number }>({ top: 72, right: 16 });
  // Which hoverable group (Design / Sourcing) is currently revealed.
  const [reveal, setReveal] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const initial = (name || email || "?").charAt(0).toUpperCase();

  const groups: Group[] = [...BASE_GROUPS];
  if (showAdmin || showVendor) {
    const items: Item[] = [];
    if (showAdmin) items.push({ href: "/admin", label: "Admin", icon: ShieldCheck });
    if (showVendor) items.push({ href: "/vendor", label: "Vendor Portal", icon: Store });
    groups.push({ title: roleLabel ?? "Staff", items });
  }

  // Portal into a PERSISTENT shared container (created once, never removed).
  // The previous per-instance container was removed on unmount; when a link
  // navigates away from a marketing page, SiteHeader unmounts mid-transition
  // and that manual removeChild raced with React's own portal teardown →
  // "removeChild: node is not a child". A container React never has to tear
  // down can't race. React just removes the menu's own nodes from it.
  useEffect(() => {
    setContainer(getPortalRoot());
  }, []);

  // Close after the route changes (never in a link's onClick).
  useEffect(() => {
    setOpen(false);
    setReveal(null);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const place = () => {
      const r = triggerRef.current?.getBoundingClientRect();
      if (r) {
        setPos({
          top: Math.round(r.bottom + 8),
          right: Math.max(8, Math.round(window.innerWidth - r.right)),
        });
      }
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Always mount the portal (only its visibility is toggled). Unmounting a
  // portal subtree while Next is swapping the route is what throws
  // removeChild — keeping it mounted makes that race impossible.
  const menu = container
    ? createPortal(
          <div
            ref={menuRef}
            role="menu"
            hidden={!open}
            style={{
              position: "fixed",
              top: pos.top,
              right: pos.right,
              display: open ? undefined : "none",
            }}
            className="z-[300] max-h-[min(82vh,680px)] w-[288px] overflow-y-auto overscroll-contain rounded-2xl border border-white/60 bg-white/95 shadow-[0_30px_80px_-24px_rgba(31,31,31,0.6)] backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 border-b border-ink/[0.07] p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-olive text-sm font-semibold text-bg">
                {initial}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-semibold">{name}</p>
                <p className="truncate text-[11.5px] text-muted">{email}</p>
                {roleLabel && (
                  <span className="mt-1 inline-block rounded-full bg-brass/12 px-2 py-[1px] text-[10px] font-semibold uppercase tracking-wide text-brass">
                    {roleLabel}
                  </span>
                )}
              </div>
            </div>

            <div className="p-2">
              {groups.map((g) => {
                const staff = g.title === (roleLabel ?? "Staff") && (showAdmin || showVendor);
                const heading = (
                  <p
                    className={
                      "px-2.5 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] " +
                      (staff ? "text-brass/80" : "text-muted/70")
                    }
                  >
                    {g.title}
                  </p>
                );

                // Flat sections: heading + all links, always shown.
                if (!g.hoverable) {
                  return (
                    <div key={g.title} className="mb-1">
                      {heading}
                      {g.items.map((item) => (
                        <ItemLink
                          key={item.href}
                          item={item}
                          active={
                            pathname === item.href ||
                            pathname.startsWith(item.href + "/")
                          }
                        />
                      ))}
                    </div>
                  );
                }

                // Hoverable (Design / Sourcing): a row that reveals its items on
                // hover, or click to keep it open on touch.
                const isOpen = reveal === g.title;
                return (
                  <div
                    key={g.title}
                    className="mb-1"
                    onMouseEnter={() => setReveal(g.title)}
                    onMouseLeave={() => setReveal((r) => (r === g.title ? null : r))}
                  >
                    <button
                      type="button"
                      onClick={() => setReveal(isOpen ? null : g.title)}
                      aria-expanded={isOpen}
                      className="flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-[13px] font-medium text-ink/80 transition-colors duration-150 hover:bg-ink/[0.06] hover:text-ink"
                    >
                      {g.title}
                      <ChevronDown
                        size={14}
                        strokeWidth={2}
                        className={
                          "text-muted transition-transform duration-200 " +
                          (isOpen ? "rotate-180" : "")
                        }
                      />
                    </button>
                    {isOpen && (
                      <div className="mt-0.5">
                        {g.items.map((item) => (
                          <div key={item.href} className="pl-3">
                            <ItemLink
                              item={item}
                              active={
                                pathname === item.href ||
                                pathname.startsWith(item.href + "/")
                              }
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <form action={signOut} className="border-t border-ink/[0.07] p-2">
              <button
                type="submit"
                role="menuitem"
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-terracotta transition-colors duration-150 hover:bg-terracotta/[0.08]"
              >
                <LogOut size={15} strokeWidth={2} />
                Log out
              </button>
            </form>
          </div>,
          container,
      )
    : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="nav-account cursor-pointer"
        title={email}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="nav-account-avatar" src={avatarUrl} alt="" />
        ) : (
          <span className="nav-account-avatar nav-account-initial">{initial}</span>
        )}
        <span className="nav-account-name">{name}</span>
      </button>
      {menu}
    </>
  );
}
