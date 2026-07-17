"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import {
  MousePointer2,
  Pentagon,
  DoorOpen,
  RectangleHorizontal,
  Trash2,
  Save,
  Check,
  Undo2,
} from "lucide-react";
import {
  polygonAreaSqFt,
  polygonCentroid,
  type FloorPlanData,
  type FpOpening,
  type FpPoint,
  type FpRoom,
} from "@/lib/floor-plan/types";
import { saveFloorPlan } from "@/lib/floor-plan/actions";

// Logical drawing area, in feet. The SVG viewBox is this × PPF pixels; the
// container keeps that aspect ratio so screen→world math is a simple ratio.
const PLAN_W_FT = 60;
const PLAN_H_FT = 42;
const PPF = 20; // pixels per foot
const VBW = PLAN_W_FT * PPF;
const VBH = PLAN_H_FT * PPF;
const CLOSE_DIST_FT = 1.2; // click this near the first vertex to close a room

type Mode = "select" | "draw" | "door" | "window";
type Selection = { type: "room" | "opening"; id: string } | null;
type Drag =
  | { kind: "vertex"; roomId: string; index: number }
  | { kind: "opening"; id: string }
  | null;

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Math.random().toString(36).slice(2)}`;

const fmtArea = (n: number) =>
  `${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })} sq ft`;

export function FloorPlannerCanvas({
  projectId,
  initialData,
  canEdit = true,
}: {
  projectId: string;
  initialData: FloorPlanData;
  canEdit?: boolean;
}) {
  const [rooms, setRooms] = useState<FpRoom[]>(initialData.rooms);
  const [openings, setOpenings] = useState<FpOpening[]>(initialData.openings);
  const [halfFtSnap, setHalfFtSnap] = useState(!!initialData.halfFtSnap);

  const [mode, setMode] = useState<Mode>("select");
  const [draft, setDraft] = useState<FpPoint[]>([]);
  const [cursor, setCursor] = useState<FpPoint | null>(null);
  const [selected, setSelected] = useState<Selection>(null);
  const [dirty, setDirty] = useState(false);
  const [pending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<Drag>(null);

  const touch = () => {
    setDirty(true);
    setSavedAt(null);
  };

  // ── coordinate helpers ──────────────────────────────────────────────
  const clientToWorld = useCallback((clientX: number, clientY: number): FpPoint => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * PLAN_W_FT,
      y: ((clientY - rect.top) / rect.height) * PLAN_H_FT,
    };
  }, []);

  const snap = useCallback(
    (p: FpPoint): FpPoint => {
      const step = halfFtSnap ? 0.5 : 1;
      const clamp = (v: number, max: number) =>
        Math.max(0, Math.min(max, Math.round(v / step) * step));
      return { x: clamp(p.x, PLAN_W_FT), y: clamp(p.y, PLAN_H_FT) };
    },
    [halfFtSnap],
  );

  // ── drawing a room ──────────────────────────────────────────────────
  const finishRoom = useCallback(() => {
    if (draft.length >= 3) {
      const n = rooms.length + 1;
      const room: FpRoom = { id: uid(), name: `Room ${n}`, points: draft };
      setRooms((r) => [...r, room]);
      setSelected({ type: "room", id: room.id });
      touch();
    }
    setDraft([]);
    setMode("select");
  }, [draft, rooms.length]);

  const cancelDraft = useCallback(() => {
    setDraft([]);
    setMode("select");
  }, []);

  // ── pointer handling on the canvas ──────────────────────────────────
  const onBackgroundPointerDown = (e: React.PointerEvent) => {
    if (!canEdit) return;
    const world = snap(clientToWorld(e.clientX, e.clientY));

    if (mode === "draw") {
      // Close if clicking near the first point (and we have a triangle+).
      if (draft.length >= 3) {
        const d = Math.hypot(draft[0].x - world.x, draft[0].y - world.y);
        if (d <= CLOSE_DIST_FT) {
          finishRoom();
          return;
        }
      }
      setDraft((p) => [...p, world]);
      return;
    }

    if (mode === "door" || mode === "window") {
      const op: FpOpening = { id: uid(), kind: mode, x: world.x, y: world.y };
      setOpenings((o) => [...o, op]);
      setSelected({ type: "opening", id: op.id });
      touch();
      return;
    }

    // select mode: background click clears selection
    setSelected(null);
  };

  const beginDrag = (e: React.PointerEvent, drag: Drag) => {
    if (!canEdit || mode !== "select") return;
    e.stopPropagation();
    dragRef.current = drag;
    svgRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const world = clientToWorld(e.clientX, e.clientY);
    setCursor(snap(world));

    const drag = dragRef.current;
    if (!drag) return;
    const p = snap(world);
    if (drag.kind === "vertex") {
      setRooms((rs) =>
        rs.map((r) =>
          r.id === drag.roomId
            ? { ...r, points: r.points.map((pt, i) => (i === drag.index ? p : pt)) }
            : r,
        ),
      );
      touch();
    } else {
      setOpenings((os) =>
        os.map((o) => (o.id === drag.id ? { ...o, x: p.x, y: p.y } : o)),
      );
      touch();
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (dragRef.current) {
      dragRef.current = null;
      svgRef.current?.releasePointerCapture(e.pointerId);
    }
  };

  // ── keyboard: Esc / Enter / Delete ──────────────────────────────────
  useEffect(() => {
    if (!canEdit) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "Escape") {
        if (mode === "draw") cancelDraft();
        else setSelected(null);
      } else if (e.key === "Enter" && mode === "draw") {
        finishRoom();
      } else if ((e.key === "Delete" || e.key === "Backspace") && selected) {
        if (selected.type === "room") setRooms((r) => r.filter((x) => x.id !== selected.id));
        else setOpenings((o) => o.filter((x) => x.id !== selected.id));
        setSelected(null);
        touch();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, selected, canEdit, cancelDraft, finishRoom]);

  const renameRoom = (id: string, name: string) => {
    setRooms((r) => r.map((x) => (x.id === id ? { ...x, name } : x)));
    touch();
  };
  const deleteRoom = (id: string) => {
    setRooms((r) => r.filter((x) => x.id !== id));
    if (selected?.id === id) setSelected(null);
    touch();
  };
  const deleteOpening = (id: string) => {
    setOpenings((o) => o.filter((x) => x.id !== id));
    if (selected?.id === id) setSelected(null);
    touch();
  };

  const undoLastPoint = () => setDraft((p) => p.slice(0, -1));

  const save = () =>
    startTransition(async () => {
      setSaveError(null);
      const res = await saveFloorPlan({
        projectId,
        data: { version: 1, halfFtSnap, rooms, openings } satisfies FloorPlanData,
      });
      if (res?.error) setSaveError(res.error);
      else {
        setDirty(false);
        setSavedAt(Date.now());
      }
    });

  // ── derived ─────────────────────────────────────────────────────────
  const totalArea = rooms.reduce((s, r) => s + polygonAreaSqFt(r.points), 0);
  const doorCount = openings.filter((o) => o.kind === "door").length;
  const windowCount = openings.filter((o) => o.kind === "window").length;

  const draftCanClose = draft.length >= 3;
  const canvasCursor =
    mode === "draw" || mode === "door" || mode === "window" ? "crosshair" : "default";

  const TOOLS: { m: Mode; icon: typeof MousePointer2; label: string }[] = [
    { m: "select", icon: MousePointer2, label: "Select" },
    { m: "draw", icon: Pentagon, label: "Room" },
    { m: "door", icon: DoorOpen, label: "Door" },
    { m: "window", icon: RectangleHorizontal, label: "Window" },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
      {/* ── canvas column ── */}
      <div>
        {/* toolbar */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-full border border-white/60 bg-white/70 p-1 backdrop-blur-xl">
            {TOOLS.map((t) => {
              const Icon = t.icon;
              const active = mode === t.m;
              return (
                <button
                  key={t.m}
                  type="button"
                  disabled={!canEdit}
                  onClick={() => {
                    if (mode === "draw" && t.m !== "draw") cancelDraft();
                    setMode(t.m);
                  }}
                  title={t.label}
                  className={
                    "flex h-9 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-semibold transition-colors " +
                    (active ? "bg-ink text-bg" : "text-ink/75 hover:bg-ink/[0.06]")
                  }
                >
                  <Icon size={15} strokeWidth={2} />
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              );
            })}
          </div>

          <label className="flex cursor-pointer items-center gap-1.5 rounded-full border border-ink/10 bg-white/60 px-3 py-2 text-[12px] font-medium text-muted">
            <input
              type="checkbox"
              checked={halfFtSnap}
              onChange={(e) => setHalfFtSnap(e.target.checked)}
              className="accent-olive"
            />
            ½ ft snap
          </label>

          {mode === "draw" && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={undoLastPoint}
                disabled={draft.length === 0}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-ink/10 px-3 text-[12px] font-medium disabled:opacity-40"
              >
                <Undo2 size={14} strokeWidth={2} /> Undo point
              </button>
              <button
                type="button"
                onClick={finishRoom}
                disabled={!draftCanClose}
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-olive px-3 text-[12px] font-semibold text-bg disabled:opacity-40"
              >
                <Check size={14} strokeWidth={2.4} /> Finish room
              </button>
            </div>
          )}
        </div>

        {mode === "draw" && (
          <p className="mb-2 text-[12px] text-muted">
            Click to drop wall corners on the grid. Click the first corner again
            (or press Enter) to close the room.
          </p>
        )}

        {/* the drawing surface */}
        <div className="overflow-x-auto rounded-2xl border border-ink/[0.08] bg-white shadow-sm">
          <div className="min-w-[560px]">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${VBW} ${VBH}`}
              className="block w-full touch-none select-none"
              style={{ aspectRatio: `${PLAN_W_FT} / ${PLAN_H_FT}`, cursor: canvasCursor }}
              onPointerDown={onBackgroundPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            >
              <defs>
                <pattern id="fp-grid" width={PPF} height={PPF} patternUnits="userSpaceOnUse">
                  <path
                    d={`M ${PPF} 0 L 0 0 0 ${PPF}`}
                    fill="none"
                    stroke="rgba(31,31,31,0.07)"
                    strokeWidth="1"
                  />
                </pattern>
                <pattern
                  id="fp-grid5"
                  width={PPF * 5}
                  height={PPF * 5}
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d={`M ${PPF * 5} 0 L 0 0 0 ${PPF * 5}`}
                    fill="none"
                    stroke="rgba(31,31,31,0.15)"
                    strokeWidth="1.4"
                  />
                </pattern>
              </defs>

              <rect width={VBW} height={VBH} fill="#ffffff" />
              <rect width={VBW} height={VBH} fill="url(#fp-grid)" />
              <rect width={VBW} height={VBH} fill="url(#fp-grid5)" />

              {/* rooms */}
              {rooms.map((room) => {
                const isSel = selected?.type === "room" && selected.id === room.id;
                const pts = room.points.map((p) => `${p.x * PPF},${p.y * PPF}`).join(" ");
                const c = polygonCentroid(room.points);
                const area = polygonAreaSqFt(room.points);
                return (
                  <g key={room.id}>
                    <polygon
                      points={pts}
                      onPointerDown={(e) => {
                        if (mode !== "select") return;
                        e.stopPropagation();
                        setSelected({ type: "room", id: room.id });
                      }}
                      fill={isSel ? "rgba(102,112,90,0.22)" : "rgba(102,112,90,0.13)"}
                      stroke="#1F1F1F"
                      strokeWidth={isSel ? 5 : 4}
                      strokeLinejoin="round"
                      style={{ cursor: mode === "select" ? "pointer" : canvasCursor }}
                    />
                    {/* labels */}
                    <text
                      x={c.x * PPF}
                      y={c.y * PPF - 4}
                      textAnchor="middle"
                      style={{ paintOrder: "stroke", stroke: "#fff", strokeWidth: 4 }}
                      className="fill-ink font-semibold"
                      fontSize={15}
                    >
                      {room.name}
                    </text>
                    <text
                      x={c.x * PPF}
                      y={c.y * PPF + 14}
                      textAnchor="middle"
                      style={{ paintOrder: "stroke", stroke: "#fff", strokeWidth: 4 }}
                      className="fill-muted"
                      fontSize={12}
                    >
                      {fmtArea(area)}
                    </text>
                    {/* vertex handles when selected */}
                    {isSel &&
                      room.points.map((p, i) => (
                        <circle
                          key={i}
                          cx={p.x * PPF}
                          cy={p.y * PPF}
                          r={7}
                          fill="#fff"
                          stroke="#66705A"
                          strokeWidth={2.5}
                          style={{ cursor: "grab" }}
                          onPointerDown={(e) =>
                            beginDrag(e, { kind: "vertex", roomId: room.id, index: i })
                          }
                        />
                      ))}
                  </g>
                );
              })}

              {/* draft polygon being drawn */}
              {draft.length > 0 && (
                <g>
                  <polyline
                    points={draft.map((p) => `${p.x * PPF},${p.y * PPF}`).join(" ")}
                    fill="none"
                    stroke="#B08D57"
                    strokeWidth={3}
                    strokeDasharray="2 5"
                    strokeLinejoin="round"
                  />
                  {cursor && (
                    <line
                      x1={draft[draft.length - 1].x * PPF}
                      y1={draft[draft.length - 1].y * PPF}
                      x2={cursor.x * PPF}
                      y2={cursor.y * PPF}
                      stroke="#B08D57"
                      strokeWidth={2}
                      strokeDasharray="2 5"
                    />
                  )}
                  {draft.map((p, i) => (
                    <circle
                      key={i}
                      cx={p.x * PPF}
                      cy={p.y * PPF}
                      r={i === 0 && draftCanClose ? 9 : 5}
                      fill={i === 0 && draftCanClose ? "#66705A" : "#B08D57"}
                    />
                  ))}
                </g>
              )}

              {/* openings */}
              {openings.map((o) => {
                const isSel = selected?.type === "opening" && selected.id === o.id;
                const color = o.kind === "door" ? "#B4523A" : "#66705A";
                return (
                  <g
                    key={o.id}
                    onPointerDown={(e) => {
                      if (mode !== "select") return;
                      setSelected({ type: "opening", id: o.id });
                      beginDrag(e, { kind: "opening", id: o.id });
                    }}
                    style={{ cursor: mode === "select" ? "grab" : canvasCursor }}
                  >
                    <circle
                      cx={o.x * PPF}
                      cy={o.y * PPF}
                      r={11}
                      fill="#fff"
                      stroke={color}
                      strokeWidth={isSel ? 3.5 : 2.5}
                    />
                    <text
                      x={o.x * PPF}
                      y={o.y * PPF + 4}
                      textAnchor="middle"
                      fontSize={12}
                      fontWeight={700}
                      fill={color}
                    >
                      {o.kind === "door" ? "D" : "W"}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* scale + counts strip */}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-muted">
          <span>Grid = 1 ft · heavy line every 5 ft</span>
          <span>
            {doorCount} door{doorCount === 1 ? "" : "s"} · {windowCount} window
            {windowCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* ── side panel ── */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/60 bg-gradient-to-b from-white to-bg/50 p-4 backdrop-blur-xl">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">
            Carpet area (drawn)
          </p>
          <p className="mt-1 font-serif text-[30px] leading-none tracking-tight">
            {totalArea.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            <span className="text-[14px] text-muted"> sq ft</span>
          </p>
          <p className="mt-1.5 text-[11.5px] text-muted">
            Sum of {rooms.length} drawn room{rooms.length === 1 ? "" : "s"}. Computed
            live — nothing estimated.
          </p>
        </div>

        {canEdit && (
          <div>
            <button
              type="button"
              disabled={pending || !dirty}
              onClick={save}
              className="btn-solid h-10 w-full text-[13px] disabled:opacity-50"
            >
              {pending ? (
                "Saving…"
              ) : savedAt && !dirty ? (
                <>
                  <Check size={15} strokeWidth={2.4} /> Saved
                </>
              ) : (
                <>
                  <Save size={15} strokeWidth={2} /> Save plan
                </>
              )}
            </button>
            {saveError && <p className="mt-1.5 text-[11.5px] text-terracotta">{saveError}</p>}
          </div>
        )}

        <div className="rounded-2xl border border-ink/[0.08] bg-white/70 p-3">
          <p className="mb-2 px-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">
            Rooms
          </p>
          {rooms.length === 0 ? (
            <p className="px-1 py-2 text-[12.5px] text-muted">
              No rooms yet. Pick <span className="font-medium text-ink">Room</span> and
              trace the walls on the grid.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {rooms.map((room) => {
                const isSel = selected?.type === "room" && selected.id === room.id;
                return (
                  <li
                    key={room.id}
                    className={
                      "flex items-center gap-2 rounded-lg px-1.5 py-1.5 " +
                      (isSel ? "bg-olive/[0.1]" : "")
                    }
                  >
                    <input
                      value={room.name}
                      onChange={(e) => renameRoom(room.id, e.target.value)}
                      onFocus={() => setSelected({ type: "room", id: room.id })}
                      className="h-8 min-w-0 flex-1 rounded-md border border-ink/10 bg-white px-2 text-[12.5px] focus:border-olive focus:outline-none"
                    />
                    <span className="shrink-0 text-[11.5px] tabular-nums text-muted">
                      {polygonAreaSqFt(room.points).toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => deleteRoom(room.id)}
                        aria-label={`Delete ${room.name}`}
                        className="shrink-0 text-muted hover:text-terracotta"
                      >
                        <Trash2 size={14} strokeWidth={1.9} />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {selected?.type === "opening" && canEdit && (
          <button
            type="button"
            onClick={() => deleteOpening(selected.id)}
            className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full border border-terracotta/30 text-[12.5px] font-medium text-terracotta hover:bg-terracotta/[0.06]"
          >
            <Trash2 size={14} strokeWidth={1.9} /> Delete selected opening
          </button>
        )}
      </div>
    </div>
  );
}
