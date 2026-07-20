/**
 * Floor-plan geometry, shared by the editor (client) and the persistence layer
 * (server). All coordinates are in FEET, snapped to the drawing grid. A room is
 * a closed polygon; an opening (door/window) is a point marker.
 */
export type FpPoint = { x: number; y: number };

export type FpRoom = {
  id: string;
  name: string;
  points: FpPoint[];
};

export type FpOpening = {
  id: string;
  kind: "door" | "window";
  x: number;
  y: number;
};

export type FloorPlanData = {
  version: 1;
  /** Snap to half-foot instead of whole-foot increments. */
  halfFtSnap?: boolean;
  rooms: FpRoom[];
  openings: FpOpening[];
};

export const EMPTY_PLAN: FloorPlanData = {
  version: 1,
  rooms: [],
  openings: [],
};

/** Shoelace area of a polygon given in feet → square feet. */
export function polygonAreaSqFt(points: FpPoint[]): number {
  if (points.length < 3) return 0;
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    sum += a.x * b.y - b.x * a.y;
  }
  return Math.abs(sum) / 2;
}

/** Simple vertex-average centroid — good enough for placing a room label. */
export function polygonCentroid(points: FpPoint[]): FpPoint {
  if (points.length === 0) return { x: 0, y: 0 };
  const s = points.reduce(
    (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
    { x: 0, y: 0 },
  );
  return { x: s.x / points.length, y: s.y / points.length };
}
