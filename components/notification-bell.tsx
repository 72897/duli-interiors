"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/notifications/actions";
import {
  Bell,
  FolderKanban,
  Sparkles,
  MessageSquare,
  ReceiptIndianRupee,
  CalendarClock,
  Box,
  Check,
  CheckCheck,
  type LucideIcon,
} from "lucide-react";

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  actionUrl?: string | null;
  readAt?: string | null;
  createdAt: string;
};

const ICON: Record<string, LucideIcon> = {
  project_update: FolderKanban,
  design_ready: Sparkles,
  comment: MessageSquare,
  estimate_approved: ReceiptIndianRupee,
  consultation_reminder: CalendarClock,
  render_complete: Box,
};

function ago(iso: string) {
  const mins = Math.round((Date.now() - +new Date(iso)) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.round(hrs / 24)}d`;
}

export function NotificationBell({ items }: { items: NotificationItem[] }) {
  const [open, setOpen] = useState(false);
  // Optimistic read overlay for instant UI; the server action persists it
  // (RLS-scoped to the user). A no-op on mock ids when the table is unapplied.
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  // Seed from server-provided read state once.
  useEffect(() => {
    setReadIds(new Set(items.filter((n) => n.readAt).map((n) => n.id)));
  }, [items]);

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

  const isRead = (n: NotificationItem) => !!n.readAt || readIds.has(n.id);
  const unread = useMemo(
    () => items.filter((n) => !isRead(n)).length,
    [items, readIds],
  );

  const markRead = (id: string) => {
    setReadIds((s) => new Set(s).add(id));
    startTransition(() => {
      void markNotificationRead(id);
    });
  };
  const markAll = () => {
    setReadIds(new Set(items.map((n) => n.id)));
    startTransition(() => {
      void markAllNotificationsRead();
    });
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        className="relative grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-white/60 bg-white/70 backdrop-blur-xl transition-colors duration-200 hover:bg-white/90"
      >
        <Bell size={15} strokeWidth={1.9} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brass px-1 text-[10px] font-bold text-bg">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-12 z-[60] w-[min(360px,92vw)] overflow-hidden rounded-2xl border border-white/60 bg-white/95 shadow-[0_28px_70px_-26px_rgba(31,31,31,0.55)] backdrop-blur-xl"
        >
          <div className="flex items-center justify-between border-b border-ink/[0.07] px-4 py-3">
            <p className="text-[13.5px] font-semibold">
              Notifications
              {unread > 0 && <span className="ml-1.5 text-muted">({unread})</span>}
            </p>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAll}
                className="flex items-center gap-1 text-[12px] font-medium text-olive hover:underline"
              >
                <CheckCheck size={13} strokeWidth={2} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[min(60vh,400px)] overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-[13px] text-muted">
                You&apos;re all caught up.
              </p>
            ) : (
              items.map((n) => {
                const Icon = ICON[n.type] ?? FolderKanban;
                const read = isRead(n);
                return (
                  <div
                    key={n.id}
                    className={
                      "flex items-start gap-3 px-4 py-3 " +
                      (read ? "opacity-60" : "bg-brass/[0.04]")
                    }
                  >
                    <span
                      className={
                        "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ring-1 " +
                        (read
                          ? "bg-ink/[0.05] text-muted ring-ink/[0.06]"
                          : "bg-brass/12 text-brass ring-brass/20")
                      }
                    >
                      <Icon size={15} strokeWidth={1.8} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <a
                          href={n.actionUrl || "/notifications"}
                          className="text-[13px] font-semibold leading-snug hover:underline"
                        >
                          {n.title}
                        </a>
                        <span className="shrink-0 text-[11px] text-muted">
                          {ago(n.createdAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-muted">
                        {n.body}
                      </p>
                    </div>
                    {!read && (
                      <button
                        type="button"
                        onClick={() => markRead(n.id)}
                        title="Mark as read"
                        aria-label="Mark as read"
                        className="mt-0.5 grid h-6 w-6 shrink-0 cursor-pointer place-items-center rounded-full text-muted hover:bg-ink/[0.06] hover:text-ink"
                      >
                        <Check size={14} strokeWidth={2} />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <a
            href="/notifications"
            className="block border-t border-ink/[0.07] px-4 py-2.5 text-center text-[12.5px] font-medium text-olive hover:bg-ink/[0.03]"
          >
            View all notifications
          </a>
        </div>
      )}
    </div>
  );
}
