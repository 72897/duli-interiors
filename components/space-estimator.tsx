"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import {
  ESTIMATOR_SPACES,
  addRange,
  defaultItemId,
  formatRange,
  scaleRange,
  swatchFor,
  type EstimatorCategory,
  type EstimatorItem,
  type EstimatorSpace,
  type ItemOverlay
} from "@/lib/estimator-data";

const MAX_QTY = 20;

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const round1 = (n: number) => Math.round(n * 10) / 10;

// Overlay calibration tool — drag/resize a cutout in the browser, then "Fix
// This Position" writes the new percentages straight into lib/estimator-data.ts
// via /api/dev-overlay. Hidden by default now that positions are calibrated;
// visit the page with ?duli-edit=on once to switch it on (remembered via
// localStorage from then on — visit with ?duli-edit=off to hide it again).
const OVERLAY_EDITOR_STORAGE_KEY = "duli-edit";

type Step = "space" | "estimate" | "boq";

const STEP_ORDER: Step[] = ["space", "estimate", "boq"];
const STEP_HEADINGS: Record<Step, string> = {
  space: "Choose Your Space",
  estimate: "",
  boq: "Your BOQ Summary"
};
// Sidebar nav labels — kept distinct from the internal step ids/headings
// above so the nav can read "Visualizer"/"Cart" without touching logic.
const STEP_LABELS: Record<Step, string> = {
  space: "Space",
  estimate: "Visualizer",
  boq: "Cart"
};

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 13l5 5L19 7" />
    </svg>
  );
}

function ItemThumb({ item, index, className }: { item: EstimatorItem; index: number; className: string }) {
  if (item.image) return <img src={item.image} alt={item.name} className={className} />;
  const [from, to] = swatchFor(index);
  return <div className={className} style={{ background: `linear-gradient(135deg, ${from}, ${to})` }} />;
}

// Blinkit-style cart control: an "Add" pill until qty>0, then a − qty + stepper.
function QtyControl({ qty, onChange, size = "md" }: { qty: number; onChange: (qty: number) => void; size?: "md" | "sm" }) {
  if (qty <= 0) {
    return (
      <button type="button" className={"est-add-btn" + (size === "sm" ? " sm" : "")} onClick={() => onChange(1)}>
        Add
      </button>
    );
  }
  return (
    <div className={"est-qty-stepper" + (size === "sm" ? " sm" : "")}>
      <button type="button" className="est-qty-btn" onClick={() => onChange(qty - 1)} aria-label="Decrease quantity">
        −
      </button>
      <span className="est-qty-value">{qty}</span>
      <button type="button" className="est-qty-btn" onClick={() => onChange(Math.min(MAX_QTY, qty + 1))} aria-label="Increase quantity">
        +
      </button>
    </div>
  );
}

type Quantities = Record<string, Record<string, Record<string, number>>>;

function buildDefaultQuantities(): Quantities {
  const result: Quantities = {};
  for (const space of ESTIMATOR_SPACES) {
    result[space.id] = {};
    for (const cat of space.categories) result[space.id][cat.key] = { [defaultItemId(cat)]: 1 };
  }
  return result;
}

export function SpaceEstimator() {
  const [step, setStep] = useState<Step>("space");
  const [spaceId, setSpaceId] = useState(ESTIMATOR_SPACES[0].id);
  const [quantities, setQuantities] = useState(buildDefaultQuantities);
  const [previewOverrides, setPreviewOverrides] = useState<Record<string, Record<string, string>>>({});
  const [categoryIndex, setCategoryIndex] = useState(0);
  const shellRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const [editMode, setEditMode] = useState(false);
  const [overlayOverride, setOverlayOverride] = useState<ItemOverlay | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [overlayEditorEnabled, setOverlayEditorEnabled] = useState(false);
  const dragRef = useRef<{
    mode: "move" | "resize" | "rotateX" | "rotateY" | "rotateZ";
    startX: number;
    startY: number;
    start: ItemOverlay;
    stageW: number;
    stageH: number;
  } | null>(null);

  // See the OVERLAY_EDITOR_STORAGE_KEY comment above — ?duli-edit=on/off in
  // the URL flips it and remembers the choice in localStorage so it doesn't
  // need repeating on every visit.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryValue = params.get(OVERLAY_EDITOR_STORAGE_KEY);
    if (queryValue === "on") localStorage.setItem(OVERLAY_EDITOR_STORAGE_KEY, "on");
    else if (queryValue === "off") localStorage.removeItem(OVERLAY_EDITOR_STORAGE_KEY);
    const enabled = localStorage.getItem(OVERLAY_EDITOR_STORAGE_KEY) === "on";
    setOverlayEditorEnabled(enabled);
    // Reopening the page otherwise resets every category back to its default
    // item (Tufted Cream bed, Wooden Side Table, 5-Door Walnut Wardrobe...),
    // which looks exactly like "the position changed" when really you're
    // just looking at a different, never-calibrated item. While calibrating,
    // restore exactly what was being looked at last time instead.
    if (enabled) {
      const saved = localStorage.getItem("duli-edit-state");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.spaceId) setSpaceId(parsed.spaceId);
          if (typeof parsed.categoryIndex === "number") setCategoryIndex(parsed.categoryIndex);
          if (parsed.previewOverrides) setPreviewOverrides(parsed.previewOverrides);
          if (parsed.step) setStep(parsed.step);
        } catch {
          // ignore malformed state
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!overlayEditorEnabled) return;
    localStorage.setItem("duli-edit-state", JSON.stringify({ spaceId, categoryIndex, previewOverrides, step }));
  }, [overlayEditorEnabled, spaceId, categoryIndex, previewOverrides, step]);

  // Matches the .est-shell mobile breakpoint in globals.css — the mobile
  // stage is a different shape than desktop's, so a cutout calibrated on one
  // doesn't land in the same spot on the other. Tracking this lets each item
  // resolve (and "Fix This Position" save) its own desktop vs. mobile value
  // instead of the two overwriting each other.
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const update = () => setIsMobileViewport(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const resolveOverlay = (item: EstimatorItem): ItemOverlay | undefined =>
    (isMobileViewport ? item.overlayMobile : undefined) ?? item.overlay;

  // This section provides its own nav (sidebar) and its panel's CTAs sit in
  // the same bottom-right corner as the site-wide header and scroll-progress
  // button, so both get hidden while this full-screen shell is in view.
  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;
    // threshold:0 (any part visible at all) — not 0.6 — because on mobile this
    // shell's height is the stage plus however long the active panel's content
    // happens to be (e.g. a full BOQ breakdown), often taller than the
    // viewport itself. Requiring 60% of the *element's own* height to be
    // visible is then mathematically unreachable, so the callback never
    // fires, "est-active" never gets set, and the site-wide header/scroll
    // button stay on screen the whole time — sitting right on top of this
    // shell's own qty steppers, Add buttons, and BOQ rows.
    const observer = new IntersectionObserver(
      ([entry]) => document.body.classList.toggle("est-active", entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      document.body.classList.remove("est-active");
    };
  }, []);

  const space = ESTIMATOR_SPACES.find((s) => s.id === spaceId) ?? ESTIMATOR_SPACES[0];
  const category = space.categories[categoryIndex % space.categories.length];
  const spaceQuantities = quantities[space.id];

  const getQty = (categoryKey: string, itemId: string) => spaceQuantities[categoryKey]?.[itemId] ?? 0;

  const setQty = (categoryKey: string, itemId: string, qty: number) => {
    setQuantities((prev) => {
      const nextCategoryQty = { ...(prev[space.id][categoryKey] ?? {}) };
      if (qty <= 0) delete nextCategoryQty[itemId];
      else nextCategoryQty[itemId] = Math.min(MAX_QTY, qty);
      return { ...prev, [space.id]: { ...prev[space.id], [categoryKey]: nextCategoryQty } };
    });
  };

  // Tapping an item previews it in the room photo without adding it to the
  // BOQ — independent of the Add/qty stepper, so people can browse designs
  // before deciding what to actually add.
  const setPreview = (categoryKey: string, itemId: string) => {
    setPreviewOverrides((prev) => ({ ...prev, [space.id]: { ...prev[space.id], [categoryKey]: itemId } }));
  };

  const handleSetQty = (categoryKey: string, itemId: string, qty: number) => {
    setQty(categoryKey, itemId, qty);
    if (qty > 0) setPreview(categoryKey, itemId);
  };

  // Preview priority: an explicit tap/add always wins; otherwise show the
  // first item already in the cart; otherwise fall back to the category's
  // default so the photo never goes blank.
  const previewItem = (cat: EstimatorCategory) => {
    const overrideId = previewOverrides[space.id]?.[cat.key];
    const override = overrideId ? cat.items.find((i) => i.id === overrideId) : undefined;
    return override ?? cat.items.find((i) => getQty(cat.key, i.id) > 0) ?? cat.items.find((i) => i.default) ?? cat.items[0];
  };

  const categoryRange = (cat: EstimatorCategory): [number, number] =>
    cat.items.reduce<[number, number]>((acc, item) => addRange(acc, scaleRange(item.range, getQty(cat.key, item.id))), [0, 0]);

  const totalRange = useMemo<[number, number]>(
    () => space.categories.reduce<[number, number]>((acc, cat) => addRange(acc, categoryRange(cat)), [0, 0]),
    [space, spaceQuantities]
  );

  const boqGroups = useMemo(() => {
    const groups: { label: string; categories: EstimatorCategory[]; range: [number, number] }[] = [];
    for (const cat of space.categories) {
      let group = groups.find((g) => g.label === cat.boqGroup);
      if (!group) {
        group = { label: cat.boqGroup, categories: [], range: [0, 0] };
        groups.push(group);
      }
      group.categories.push(cat);
      group.range = addRange(group.range, categoryRange(cat));
    }
    return groups;
  }, [space, spaceQuantities]);

  const selectedEntries = useMemo(
    () =>
      space.categories.flatMap((cat) =>
        cat.items
          .map((item) => ({ cat, item, qty: getQty(cat.key, item.id) }))
          .filter((entry) => entry.qty > 0)
      ),
    [space, spaceQuantities]
  );

  const today = useMemo(
    () => new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    []
  );

  const itemsSelected = selectedEntries.reduce((sum, entry) => sum + entry.qty, 0);
  const shareText = `Duli BOQ Summary — ${space.name}, Premium finish, ${itemsSelected} items selected. Estimated project range: ${formatRange(totalRange)}. Sent from duliinteriors.com`;

  const activeItem = previewItem(category);
  const resolvedBaseImage = (isMobileViewport ? space.baseImageMobile : undefined) ?? space.baseImage;
  const canEditActiveOverlay = step === "estimate" && !!resolvedBaseImage && !!resolveOverlay(activeItem);
  const effectiveOverlay = overlayOverride ?? (canEditActiveOverlay ? resolveOverlay(activeItem)! : null);

  // Every category that currently has a previewable item (bed, wardrobe,
  // etc.) gets composited onto the same base photo at once, not just the
  // one for the tab you happen to have open — so the room shows everything
  // you've picked across Bed/Side Table/Wardrobe together.
  const liveComposites =
    step === "estimate" && resolvedBaseImage
      ? space.categories
          .map((cat) => {
            const item = previewItem(cat);
            const overlay = resolveOverlay(item);
            return overlay ? { cat, item, overlay } : null;
          })
          .filter((entry): entry is { cat: EstimatorCategory; item: EstimatorItem; overlay: ItemOverlay } => entry !== null)
      : [];

  const goToSpace = (id: string) => {
    setSpaceId(id);
    setCategoryIndex(0);
  };

  // Reset any in-progress edit whenever the item being viewed changes, so a
  // drag on one bed never leaks into the next selection.
  useEffect(() => {
    setOverlayOverride(null);
    setSaveState("idle");
  }, [activeItem.id, isMobileViewport]);

  const onOverlayPointerMove = (e: PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (drag.mode === "move") {
      setOverlayOverride({
        ...drag.start,
        left: round1(clamp(drag.start.left + (dx / drag.stageW) * 100, 5, 95)),
        bottom: round1(clamp(drag.start.bottom - (dy / drag.stageH) * 100, -10, 80))
      });
    } else if (drag.mode === "resize") {
      setOverlayOverride({
        ...drag.start,
        width: round1(clamp(drag.start.width + ((dx * 2) / drag.stageW) * 100, 5, 90))
      });
    } else if (drag.mode === "rotateY") {
      // Drag left/right to turn the cutout, like a wardrobe's far edge
      // receding into a side wall instead of facing the camera.
      setOverlayOverride({
        ...drag.start,
        rotateY: round1(clamp((drag.start.rotateY ?? 0) + dx / 3, -85, 85))
      });
    } else if (drag.mode === "rotateX") {
      // Drag up/down to tilt the cutout forward/back, like a piece sitting
      // flat on the floor vs standing upright.
      setOverlayOverride({
        ...drag.start,
        rotateX: round1(clamp((drag.start.rotateX ?? 0) - dy / 3, -85, 85))
      });
    } else {
      // Drag left/right around the item to roll it, like leveling a frame
      // that's sitting crooked.
      setOverlayOverride({
        ...drag.start,
        rotateZ: round1(clamp((drag.start.rotateZ ?? 0) + dx / 3, -45, 45))
      });
    }
  };

  const onOverlayPointerUp = () => {
    dragRef.current = null;
    window.removeEventListener("pointermove", onOverlayPointerMove);
    window.removeEventListener("pointerup", onOverlayPointerUp);
  };

  const startOverlayDrag = (mode: "move" | "resize" | "rotateX" | "rotateY" | "rotateZ") => (e: ReactPointerEvent) => {
    if (!effectiveOverlay || !stageRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = stageRef.current.getBoundingClientRect();
    dragRef.current = { mode, startX: e.clientX, startY: e.clientY, start: effectiveOverlay, stageW: rect.width, stageH: rect.height };
    window.addEventListener("pointermove", onOverlayPointerMove);
    window.addEventListener("pointerup", onOverlayPointerUp);
  };

  const handleFixPosition = async () => {
    if (!effectiveOverlay) return;
    setSaveState("saving");
    try {
      const res = await fetch("/api/dev-overlay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: activeItem.id,
          overlay: effectiveOverlay,
          field: isMobileViewport ? "overlayMobile" : "overlay"
        })
      });
      if (!res.ok) throw new Error("save failed");
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  };

  return (
    <div className="est-shell" id="estimator" ref={shellRef}>
      <aside className="est-sidebar">
        {STEP_ORDER.map((s) =>
          s === step ? (
            <span key={s} className="est-sidebar-dial">
              <span className={"est-sidebar-dial-label" + (s === "estimate" ? " est-sidebar-dial-label-visualizer" : "")}>
                {STEP_LABELS[s].toUpperCase()}
              </span>
            </span>
          ) : (
            <button key={s} type="button" className="est-sidebar-item" onClick={() => setStep(s)}>
              <span className="est-sidebar-label">{STEP_LABELS[s].toUpperCase()}</span>
            </button>
          )
        )}
      </aside>

      <div className="est-stage" ref={stageRef}>
        {liveComposites.length > 0 ? (
          <>
            <Image
              src={resolvedBaseImage!}
              alt={space.name}
              fill
              sizes="(max-width: 900px) 100vw, 70vw"
              quality={70}
              className="est-stage-bg"
            />
            {liveComposites.map(({ cat, item, overlay: baseOverlay }) => {
              const isActive = cat.key === category.key;
              const overlay = isActive ? effectiveOverlay : baseOverlay;
              if (!overlay) return null;
              return (
                <div
                  key={cat.key}
                  className="est-overlay-wrap"
                  style={{
                    bottom: `${overlay.bottom}%`,
                    left: `${overlay.left}%`,
                    width: `${overlay.width}%`,
                    transform: `translateX(-50%) perspective(900px) rotateX(${overlay.rotateX ?? 0}deg) rotateY(${overlay.rotateY ?? 0}deg) rotateZ(${overlay.rotateZ ?? 0}deg)`
                  }}
                >
                  <img src={item.image} alt={item.name} className="est-stage-overlay-item" />
                  {isActive && editMode && (
                    <>
                      <div className="est-overlay-drag-handle" onPointerDown={startOverlayDrag("move")} />
                      <div className="est-overlay-resize-handle" onPointerDown={startOverlayDrag("resize")} title="Resize" />
                      <div className="est-overlay-rotate-handle est-overlay-rotate-y" onPointerDown={startOverlayDrag("rotateY")} title="Turn left/right (Y axis)">
                        ⟲
                      </div>
                      <div className="est-overlay-rotate-handle est-overlay-rotate-x" onPointerDown={startOverlayDrag("rotateX")} title="Tilt forward/back (X axis)">
                        ⥮
                      </div>
                      <div className="est-overlay-rotate-handle est-overlay-rotate-z" onPointerDown={startOverlayDrag("rotateZ")} title="Roll/level (Z axis)">
                        ↻
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </>
        ) : (
          <>
            <Image src={space.image} alt={space.name} fill sizes="(max-width: 900px) 100vw, 70vw" quality={70} className="est-stage-bg" />
          </>
        )}
        <div className="est-stage-scrim" />
        <h1 className="est-stage-heading">{STEP_HEADINGS[step]}</h1>

        {overlayEditorEnabled && canEditActiveOverlay && effectiveOverlay && !editMode && (
          <button type="button" className="est-edit-toggle" onClick={() => setEditMode(true)}>
            Edit Position
          </button>
        )}

        {overlayEditorEnabled && canEditActiveOverlay && effectiveOverlay && editMode && (
          <div className="est-overlay-toolbar">
            <span className="est-overlay-toolbar-readout">
              [{isMobileViewport ? "MOBILE" : "DESKTOP"}] bottom {effectiveOverlay.bottom}% · width {effectiveOverlay.width}% · left{" "}
              {effectiveOverlay.left}% · X {effectiveOverlay.rotateX ?? 0}° · Y {effectiveOverlay.rotateY ?? 0}° · Z{" "}
              {effectiveOverlay.rotateZ ?? 0}°
            </span>
            <button type="button" onClick={() => setOverlayOverride(null)}>
              Reset
            </button>
            <button type="button" className="primary" onClick={handleFixPosition} disabled={saveState === "saving"}>
              {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved ✓" : saveState === "error" ? "Failed — retry" : "Fix This Position"}
            </button>
            <button type="button" onClick={() => setEditMode(false)}>
              Done
            </button>
          </div>
        )}

      </div>

      <div className="est-panel">
        {step === "space" && <SpacePanel space={space} onSelectSpace={goToSpace} onContinue={() => setStep("estimate")} />}

        {step === "estimate" && (
          <EstimatePanel
            space={space}
            category={category}
            categoryIndex={categoryIndex % space.categories.length}
            previewId={activeItem.id}
            getQty={(itemId) => getQty(category.key, itemId)}
            onSetQty={(itemId, qty) => handleSetQty(category.key, itemId, qty)}
            onPreview={(itemId) => setPreview(category.key, itemId)}
            onSelectCategory={(i) => setCategoryIndex(i)}
            onContinue={() => setStep("boq")}
          />
        )}

        {step === "boq" && (
          <BoqPanel
            space={space}
            selectedEntries={selectedEntries}
            itemsSelected={itemsSelected}
            today={today}
            boqGroups={boqGroups}
            totalRange={totalRange}
            shareText={shareText}
            onSetQty={setQty}
            onModify={() => setStep("space")}
          />
        )}
      </div>
    </div>
  );
}

function SpacePanel({
  space,
  onSelectSpace,
  onContinue
}: {
  space: EstimatorSpace;
  onSelectSpace: (id: string) => void;
  onContinue: () => void;
}) {
  return (
    <div className="est-panel-inner">
      <p className="est-panel-title">Select Space</p>
      <p className="est-panel-sub">You can refine the details in the next step.</p>
      <div className="est-panel-list">
        {ESTIMATOR_SPACES.map((s) => (
          <button
            key={s.id}
            type="button"
            className={"est-panel-row" + (s.id === space.id ? " selected" : "")}
            onClick={() => onSelectSpace(s.id)}
          >
            <img src={s.image} alt={s.name} className="est-panel-thumb" />
            <span className="est-panel-row-text">
              <strong>{s.name}</strong>
            </span>
            {s.id === space.id && (
              <span className="est-panel-check">
                <CheckIcon />
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="est-panel-footer">
        <button type="button" className="est-panel-cta" onClick={onContinue}>
          Continue to Estimate <ArrowIcon />
        </button>
      </div>
    </div>
  );
}

function EstimatePanel({
  space,
  category,
  categoryIndex,
  previewId,
  getQty,
  onSetQty,
  onPreview,
  onSelectCategory,
  onContinue
}: {
  space: EstimatorSpace;
  category: EstimatorCategory;
  categoryIndex: number;
  previewId: string;
  getQty: (itemId: string) => number;
  onSetQty: (itemId: string, qty: number) => void;
  onPreview: (itemId: string) => void;
  onSelectCategory: (index: number) => void;
  onContinue: () => void;
}) {
  const canPreview = category.items.some((i) => i.overlay);

  return (
    <div className="est-panel-inner">
      <div className="est-category-tabs">
        {space.categories.map((cat, i) => (
          <button
            key={cat.key}
            type="button"
            className={"est-category-tab" + (i === categoryIndex ? " active" : "")}
            onClick={() => onSelectCategory(i)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <p className="est-panel-title">{category.label} Options</p>
      <p className="est-panel-sub">{canPreview ? "Click an option to visualize it, then add what you need" : "Add as many as you need"}</p>

      <div className="est-panel-list est-panel-list-scroll">
        {category.items.map((item, i) => {
          const qty = getQty(item.id);
          const isPreviewing = canPreview && item.id === previewId;
          return (
            <div className={"est-panel-row" + (qty > 0 ? " selected" : "") + (isPreviewing ? " previewing" : "")} key={item.id}>
              <button
                type="button"
                className="est-panel-row-main"
                onClick={() => item.overlay && onPreview(item.id)}
                disabled={!item.overlay}
              >
                <ItemThumb item={item} index={i} className="est-panel-thumb" />
                <span className="est-panel-row-text">
                  <strong>{item.name}</strong>
                  {isPreviewing && (
                    <span>
                      <span className="est-preview-badge">Viewing</span>
                    </span>
                  )}
                </span>
              </button>
              <QtyControl qty={qty} onChange={(next) => onSetQty(item.id, next)} />
            </div>
          );
        })}
      </div>

      <div className="est-panel-footer">
        <button type="button" className="est-panel-cta" onClick={onContinue}>
          Continue to Cart <ArrowIcon />
        </button>
      </div>
    </div>
  );
}

function BoqPanel({
  space,
  selectedEntries,
  itemsSelected,
  today,
  boqGroups,
  totalRange,
  shareText,
  onSetQty,
  onModify
}: {
  space: EstimatorSpace;
  selectedEntries: { cat: EstimatorCategory; item: EstimatorItem; qty: number }[];
  itemsSelected: number;
  today: string;
  boqGroups: { label: string; categories: EstimatorCategory[]; range: [number, number] }[];
  totalRange: [number, number];
  shareText: string;
  onSetQty: (categoryKey: string, itemId: string, qty: number) => void;
  onModify: () => void;
}) {
  return (
    <div className="est-panel-inner est-panel-scroll">
      <p className="est-panel-title">Your BOQ Summary</p>
      <p className="est-panel-sub">Transparent estimate for your selected scope</p>

      <div className="est-chip-row-dark">
        <div className="est-chip-dark">
          <span>Space</span>
          <strong>{space.name}</strong>
        </div>
        <div className="est-chip-dark">
          <span>Finish</span>
          <strong>Premium</strong>
        </div>
        <div className="est-chip-dark">
          <span>Items</span>
          <strong>{itemsSelected}</strong>
        </div>
        <div className="est-chip-dark">
          <span>Date</span>
          <strong>{today}</strong>
        </div>
      </div>

      <p className="est-panel-subhead">Selected Scope</p>
      <div className="est-scope-list">
        {selectedEntries.length === 0 && <p className="est-panel-sub">Nothing added yet — go back to Estimate to add items.</p>}
        {selectedEntries.map(({ cat, item, qty }, i) => (
          <div className="est-panel-row selected" key={item.id}>
            <ItemThumb item={item} index={i} className="est-panel-thumb" />
            <span className="est-panel-row-text">
              <strong>{item.name}</strong>
              <span>
                {cat.label} · {formatRange(item.range)}
              </span>
            </span>
            <QtyControl qty={qty} onChange={(next) => onSetQty(cat.key, item.id, next)} size="sm" />
          </div>
        ))}
      </div>

      <p className="est-panel-subhead">BOQ Breakup</p>
      <div className="est-boq-list-dark">
        {boqGroups.map((group) => (
          <div className="est-boq-row-dark" key={group.label}>
            <span>{group.label}</span>
            <strong>{formatRange(group.range)}</strong>
          </div>
        ))}
        <div className="est-boq-row-dark">
          <span>Installation &amp; Execution</span>
          <strong className="included">Included</strong>
        </div>
      </div>

      <div className="est-total-dark">
        <span>Total Estimated Range</span>
        <strong>{formatRange(totalRange)}</strong>
      </div>
      <p className="est-fine-print-dark">Indicative estimate — your final BOQ is confirmed after a site visit.</p>

      <div className="est-panel-footer est-panel-footer-col">
        <a className="est-panel-cta" href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer">
          Send BOQ on WhatsApp
        </a>
        <a className="est-panel-cta est-panel-cta-ghost" href="/#contact">
          Book Free Design Consultation
        </a>
        <button type="button" className="est-panel-link" onClick={onModify}>
          Modify Selections
        </button>
      </div>
    </div>
  );
}
