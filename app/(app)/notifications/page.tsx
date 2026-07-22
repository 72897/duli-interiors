import type { Metadata } from "next";
import {
  FolderKanban,
  Sparkles,
  MessageSquare,
  ReceiptIndianRupee,
  CalendarClock,
  Box,
  type LucideIcon,
} from "lucide-react";
import { getNotifications } from "@/lib/services";
import { PageHead, Panel, MockNotice } from "@/components/app-ui";
import { EmptyState } from "@/components/dashboard-ui";
import type { Notification } from "@/lib/types";

export const metadata: Metadata = { title: "Notifications — Duli Interiors" };

const ICON: Record<Notification["type"], LucideIcon> = {
  project_update: FolderKanban,
  design_ready: Sparkles,
  comment: MessageSquare,
  estimate_approved: ReceiptIndianRupee,
  consultation_reminder: CalendarClock,
  render_complete: Box,
};

/** "3h ago" reads better than a timestamp for a feed. */
function ago(iso: string) {
  const mins = Math.round((Date.now() - +new Date(iso)) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export default async function NotificationsPage() {
  const notifications = await getNotifications();
  const unread = notifications.filter((n) => !n.readAt).length;

  return (
    <div>
      <PageHead
        eyebrow="Account"
        title="Notifications"
        intro={
          unread > 0
            ? `${unread} unread update${unread === 1 ? "" : "s"} across your projects.`
            : "Updates across your projects, designs and estimates."
        }
      />

      <MockNotice>
        Sample notifications. Marking as read isn&apos;t persisted yet — the feed
        rebuilds on each load.
      </MockNotice>

      {notifications.length === 0 ? (
        <EmptyState
          title="You're all caught up"
          description="Updates about your designs, estimates and consultations will land here."
          ctaHref="/projects"
          ctaLabel="View your projects"
        />
      ) : (
        <div className="space-y-2.5">
          {notifications.map((n) => {
            const Icon = ICON[n.type] ?? FolderKanban;
            const isUnread = !n.readAt;
            const body = (
              <div className="flex items-start gap-3.5 p-4">
                <span
                  className={
                    "grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 " +
                    (isUnread
                      ? "bg-brass/12 text-brass ring-brass/20"
                      : "bg-ink/[0.05] text-muted ring-ink/[0.06]")
                  }
                >
                  <Icon size={17} strokeWidth={1.8} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p
                      className={
                        "text-[14px] " +
                        (isUnread ? "font-semibold text-ink" : "font-medium text-muted")
                      }
                    >
                      {n.title}
                    </p>
                    <span className="shrink-0 text-[11.5px] text-muted">
                      {ago(n.createdAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted">
                    {n.body}
                  </p>
                </div>
                {/* Unread dot — the only thing carrying state, so it earns colour */}
                {isUnread && (
                  <span
                    aria-label="Unread"
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brass"
                  />
                )}
              </div>
            );

            return (
              <Panel
                key={n.id}
                className={isUnread ? "" : "opacity-80"}
              >
                {n.actionUrl ? (
                  <a
                    href={n.actionUrl}
                    className="block cursor-pointer transition-colors duration-200 hover:bg-ink/[0.02]"
                  >
                    {body}
                  </a>
                ) : (
                  body
                )}
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}
