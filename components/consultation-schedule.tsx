"use client";

import { useMemo, useState } from "react";
import {
  Phone,
  Video,
  Home as HomeIcon,
  MapPin,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  List,
  type LucideIcon,
} from "lucide-react";
import { ConsultationStatusControl } from "./consultation-status";
import type { Consultation } from "@/lib/types";

const MODE: Record<Consultation["mode"], { icon: LucideIcon; label: string }> = {
  call: { icon: Phone, label: "Phone call" },
  video: { icon: Video, label: "Video call" },
  site_visit: { icon: HomeIcon, label: "Site visit" },
};

const STATUS_TONE: Record<
  Consultation["status"],
  "neutral" | "brass" | "olive" | "terracotta"
> = {
  requested: "brass",
  scheduled: "olive",
  completed: "neutral",
  cancelled: "terracotta",
};

// Dot/accent colour per status, for the calendar chips.
const STATUS_HEX: Record<Consultation["status"], string> = {
  requested: "#B08D57",
  scheduled: "#66705A",
  completed: "#9a968c",
  cancelled: "#B4523A",
};

const PILL_CLASS: Record<"neutral" | "brass" | "olive" | "terracotta", string> = {
  neutral: "bg-ink/[0.06] text-muted",
  brass: "bg-brass/12 text-brass",
  olive: "bg-olive/12 text-olive",
  terracotta: "bg-terracotta/12 text-terracotta",
};

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

const longWhen = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

const timeOnly = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function Card({ c, staff }: { c: Consultation; staff: boolean }) {
  const mode = MODE[c.mode];
  const Icon = mode.icon;
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/60 bg-white/70 p-5 backdrop-blur-xl">
      <div className="flex min-w-0 items-center gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brass/12 text-brass ring-1 ring-brass/20">
          <Icon size={18} strokeWidth={1.8} />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="text-[14.5px] font-semibold">
              {staff && c.customerName ? c.customerName : mode.label}
            </p>
            <span
              className={
                "rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize " +
                PILL_CLASS[STATUS_TONE[c.status]]
              }
            >
              {c.status}
            </span>
          </div>
          <p className="mt-0.5 text-[12.5px] text-muted">
            {staff && c.customerName ? `${mode.label} · ` : ""}
            {longWhen(c.scheduledAt)}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-muted">
            <span className="inline-flex items-center gap-1">
              <MapPin size={11} strokeWidth={1.8} />
              {c.city}
            </span>
            {c.designerName && <span>· with {c.designerName}</span>}
            {c.projectName && <span>· {c.projectName}</span>}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        {staff && <ConsultationStatusControl id={c.id} status={c.status} />}
        {c.projectId && (
          <a
            href={`/projects/${c.projectId}`}
            className="text-[12.5px] font-medium text-olive underline underline-offset-2"
          >
            Open project →
          </a>
        )}
      </div>
    </div>
  );
}

function ListView({
  consultations,
  staff,
}: {
  consultations: Consultation[];
  staff: boolean;
}) {
  const now = Date.now();
  const upcoming = consultations
    .filter((c) => new Date(c.scheduledAt).getTime() >= now && c.status !== "cancelled")
    .sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt));
  const past = consultations
    .filter((c) => !upcoming.includes(c))
    .sort((a, b) => +new Date(b.scheduledAt) - +new Date(a.scheduledAt));

  return (
    <div className="space-y-8">
      {upcoming.length > 0 && (
        <section>
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            Upcoming
          </h3>
          <div className="space-y-3">
            {upcoming.map((c) => (
              <Card key={c.id} c={c} staff={staff} />
            ))}
          </div>
        </section>
      )}
      {past.length > 0 && (
        <section>
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            Past
          </h3>
          <div className="space-y-3 opacity-75">
            {past.map((c) => (
              <Card key={c.id} c={c} staff={staff} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function CalendarView({
  consultations,
  staff,
}: {
  consultations: Consultation[];
  staff: boolean;
}) {
  const today = new Date();
  const [cursor, setCursor] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [selected, setSelected] = useState<Date>(today);

  // Group by local day so a chip lands on the date the user actually sees.
  const byDay = useMemo(() => {
    const map = new Map<string, Consultation[]>();
    for (const c of consultations) {
      const k = dayKey(new Date(c.scheduledAt));
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(c);
    }
    for (const list of map.values())
      list.sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt));
    return map;
  }, [consultations]);

  const first = new Date(cursor.y, cursor.m, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(cursor.y, cursor.m, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const monthLabel = first.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const step = (delta: number) =>
    setCursor((c) => {
      const d = new Date(c.y, c.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  const goToday = () => {
    setCursor({ y: today.getFullYear(), m: today.getMonth() });
    setSelected(today);
  };

  const selectedList = byDay.get(dayKey(selected)) ?? [];

  return (
    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <div className="rounded-2xl border border-white/60 bg-white/70 p-4 backdrop-blur-xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-serif text-[18px]">{monthLabel}</h3>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={goToday}
              className="rounded-full border border-ink/10 px-3 py-1.5 text-[12px] font-medium hover:bg-ink/[0.05]"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous month"
              className="grid h-8 w-8 place-items-center rounded-full border border-ink/10 hover:bg-ink/[0.05]"
            >
              <ChevronLeft size={16} strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next month"
              className="grid h-8 w-8 place-items-center rounded-full border border-ink/10 hover:bg-ink/[0.05]"
            >
              <ChevronRight size={16} strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((w) => (
            <div
              key={w}
              className="pb-1 text-center text-[10.5px] font-semibold uppercase tracking-wide text-muted"
            >
              {w}
            </div>
          ))}
          {cells.map((date, i) => {
            if (!date) return <div key={i} />;
            const list = byDay.get(dayKey(date)) ?? [];
            const isToday = dayKey(date) === dayKey(today);
            const isSelected = dayKey(date) === dayKey(selected);
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(date)}
                className={
                  "flex min-h-[64px] flex-col rounded-lg border p-1.5 text-left transition-colors " +
                  (isSelected
                    ? "border-olive bg-olive/[0.08]"
                    : "border-ink/[0.06] hover:bg-ink/[0.03]")
                }
              >
                <span
                  className={
                    "mb-1 grid h-5 w-5 place-items-center self-end rounded-full text-[11px] tabular-nums " +
                    (isToday ? "bg-ink font-semibold text-bg" : "text-muted")
                  }
                >
                  {date.getDate()}
                </span>
                <span className="flex flex-1 flex-col gap-0.5">
                  {list.slice(0, 2).map((c) => (
                    <span
                      key={c.id}
                      className="truncate rounded-[4px] px-1 py-0.5 text-[10px] font-medium leading-tight text-white"
                      style={{ backgroundColor: STATUS_HEX[c.status] }}
                      title={`${timeOnly(c.scheduledAt)} · ${MODE[c.mode].label}`}
                    >
                      {timeOnly(c.scheduledAt)} {MODE[c.mode].label.split(" ")[0]}
                    </span>
                  ))}
                  {list.length > 2 && (
                    <span className="px-1 text-[10px] text-muted">+{list.length - 2} more</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected-day detail */}
      <div>
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
          {selected.toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </h3>
        {selectedList.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-ink/12 px-4 py-6 text-center text-[13px] text-muted">
            No consultations on this day.
          </p>
        ) : (
          <div className="space-y-3">
            {selectedList.map((c) => (
              <Card key={c.id} c={c} staff={staff} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ConsultationSchedule({
  consultations,
  staff,
}: {
  consultations: Consultation[];
  staff: boolean;
}) {
  const [view, setView] = useState<"list" | "calendar">("list");

  const TABS: { key: "list" | "calendar"; icon: LucideIcon; label: string }[] = [
    { key: "list", icon: List, label: "List" },
    { key: "calendar", icon: CalendarDays, label: "Calendar" },
  ];

  return (
    <div>
      <div className="mb-5 inline-flex gap-1 rounded-full border border-white/60 bg-white/70 p-1 backdrop-blur-xl">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = view === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setView(t.key)}
              className={
                "flex h-9 items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold transition-colors " +
                (active ? "bg-ink text-bg" : "text-ink/75 hover:bg-ink/[0.06]")
              }
            >
              <Icon size={15} strokeWidth={2} />
              {t.label}
            </button>
          );
        })}
      </div>

      {view === "list" ? (
        <ListView consultations={consultations} staff={staff} />
      ) : (
        <CalendarView consultations={consultations} staff={staff} />
      )}
    </div>
  );
}
