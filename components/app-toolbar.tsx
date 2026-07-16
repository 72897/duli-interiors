"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Sparkles, ChevronDown, FolderKanban, CornerDownLeft } from "lucide-react";
import { NotificationBell, type NotificationItem } from "@/components/notification-bell";

/**
 * App utility bar: global search, active-project switcher, notifications and
 * the AI-credits meter.
 *
 * Deliberately not a nav — the sidebar and the site header already handle
 * navigation, and duplicating them here is what makes an app feel cluttered.
 *
 * Search is client-side over data the server already sent. That's honest for
 * this size of dataset (a user's own projects plus a fixed page list) and it
 * stays instant with no endpoint to get out of sync.
 */

export type SearchTarget = { id: string; label: string; sub?: string; href: string };

const PAGES: SearchTarget[] = [
  { id: "p-dashboard", label: "Dashboard", sub: "Page", href: "/dashboard" },
  { id: "p-projects", label: "Projects", sub: "Page", href: "/projects" },
  { id: "p-ai", label: "AI Studio", sub: "Page", href: "/ai-studio" },
  { id: "p-floor", label: "Floor Planner", sub: "Page", href: "/floor-planner" },
  { id: "p-3d", label: "3D Studio", sub: "Page", href: "/3d-studio" },
  { id: "p-catalog", label: "Catalog", sub: "Page", href: "/catalog" },
  { id: "p-estimates", label: "Estimates", sub: "Page", href: "/estimates" },
  { id: "p-consult", label: "Consultations", sub: "Page", href: "/consultations" },
  { id: "p-notif", label: "Notifications", sub: "Page", href: "/notifications" },
  { id: "p-profile", label: "Profile", sub: "Page", href: "/profile" },
  { id: "p-settings", label: "Settings", sub: "Page", href: "/settings" },
];

export function AppToolbar({
  projects,
  notifications,
  credits,
}: {
  projects: { id: string; name: string; code: string; status: string }[];
  notifications: NotificationItem[];
  credits: { used: number; total: number };
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const switcherRef = useRef<HTMLDivElement>(null);

  const targets = useMemo<SearchTarget[]>(
    () => [
      ...projects.map((p) => ({
        id: p.id,
        label: p.name,
        sub: `${p.code} · ${p.status.replace(/_/g, " ")}`,
        href: `/projects/${p.id}`,
      })),
      ...PAGES,
    ],
    [projects],
  );

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return targets.slice(0, 7);
    return targets
      .filter(
        (t) =>
          t.label.toLowerCase().includes(term) ||
          (t.sub ?? "").toLowerCase().includes(term),
      )
      .slice(0, 7);
  }, [q, targets]);

  // ⌘K / Ctrl+K opens search from anywhere; Escape always closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setSwitcherOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setCursor(0);
      // Focus directly: React attaches refs before effects run, so the input is
      // already mounted here. Deferring to requestAnimationFrame would silently
      // skip the focus in a backgrounded tab, where RAF never fires.
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setSwitcherOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const go = (href: string) => {
    window.location.href = href;
  };

  const onSearchKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter" && results[cursor]) {
      e.preventDefault();
      go(results[cursor].href);
    }
  };

  const remaining = Math.max(0, credits.total - credits.used);
  const active = projects[0];

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-2.5">
        {/* Search trigger */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group flex h-10 flex-1 cursor-pointer items-center gap-2.5 rounded-full border border-white/60 bg-white/70 px-4 text-left text-[13px] text-muted backdrop-blur-xl transition-colors duration-200 hover:bg-white/90 sm:max-w-[320px]"
        >
          <Search size={15} strokeWidth={1.9} />
          <span className="flex-1">Search projects and pages…</span>
          <kbd className="hidden rounded border border-ink/10 bg-ink/[0.04] px-1.5 py-0.5 font-sans text-[10px] text-muted sm:block">
            ⌘K
          </kbd>
        </button>

        {/* Active project switcher */}
        {active && (
          <div ref={switcherRef} className="relative">
            <button
              type="button"
              onClick={() => setSwitcherOpen((v) => !v)}
              aria-expanded={switcherOpen}
              aria-haspopup="menu"
              className="flex h-10 cursor-pointer items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3.5 text-[13px] backdrop-blur-xl transition-colors duration-200 hover:bg-white/90"
            >
              <FolderKanban size={14} strokeWidth={1.9} className="text-brass" />
              <span className="max-w-[130px] truncate">{active.name}</span>
              <ChevronDown size={13} strokeWidth={2} className="text-muted" />
            </button>

            {switcherOpen && (
              <div
                role="menu"
                className="absolute right-0 top-12 z-50 w-[240px] overflow-hidden rounded-2xl border border-white/60 bg-white/95 p-1.5 shadow-[0_24px_60px_-24px_rgba(31,31,31,0.5)] backdrop-blur-xl"
              >
                {projects.slice(0, 6).map((p) => (
                  <a
                    key={p.id}
                    role="menuitem"
                    href={`/projects/${p.id}`}
                    className="block cursor-pointer rounded-lg px-3 py-2 transition-colors duration-150 hover:bg-ink/[0.06]"
                  >
                    <p className="truncate text-[13px]">{p.name}</p>
                    <p className="text-[11px] text-muted">{p.code}</p>
                  </a>
                ))}
                <a
                  href="/projects"
                  className="mt-1 block cursor-pointer rounded-lg border-t border-ink/[0.07] px-3 py-2 text-[12.5px] text-olive"
                >
                  View all projects →
                </a>
              </div>
            )}
          </div>
        )}

        {/* AI credits — a usage meter, not billing */}
        <a
          href="/profile"
          title={`${remaining} of ${credits.total} AI credits left — free while in preview`}
          className="flex h-10 cursor-pointer items-center gap-1.5 rounded-full border border-white/60 bg-white/70 px-3.5 text-[13px] backdrop-blur-xl transition-colors duration-200 hover:bg-white/90"
        >
          <Sparkles size={14} strokeWidth={1.9} className="text-brass" />
          <span className="tabular-nums">{remaining}</span>
          <span className="hidden text-muted sm:inline">credits</span>
        </a>

        {/* Notifications — popup with mark-as-read */}
        <NotificationBell items={notifications} />
      </div>

      {/* Search palette */}
      {open && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[14vh]">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="relative w-[min(560px,92vw)] overflow-hidden rounded-2xl border border-white/60 bg-white/95 shadow-[0_40px_90px_-30px_rgba(31,31,31,0.6)] backdrop-blur-xl">
            <div className="flex items-center gap-2.5 border-b border-ink/[0.07] px-4">
              <Search size={16} strokeWidth={1.9} className="text-muted" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setCursor(0);
                }}
                onKeyDown={onSearchKey}
                placeholder="Search projects and pages…"
                aria-label="Search"
                className="h-12 flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted"
              />
            </div>

            <div className="max-h-[320px] overflow-y-auto p-1.5">
              {results.length === 0 ? (
                <p className="px-3 py-6 text-center text-[13px] text-muted">
                  Nothing matches “{q}”.
                </p>
              ) : (
                results.map((r, i) => (
                  <a
                    key={r.id}
                    href={r.href}
                    onMouseEnter={() => setCursor(i)}
                    className={
                      "flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 " +
                      (i === cursor ? "bg-ink/[0.07]" : "")
                    }
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[13.5px]">{r.label}</span>
                      {r.sub && (
                        <span className="block truncate text-[11.5px] capitalize text-muted">
                          {r.sub}
                        </span>
                      )}
                    </span>
                    {i === cursor && (
                      <CornerDownLeft size={13} strokeWidth={2} className="shrink-0 text-muted" />
                    )}
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
