import {
  polygonAreaSqFt,
  polygonCentroid,
  type FloorPlanData,
} from "@/lib/floor-plan/types";

const PPF = 20; // pixels per foot, matches the editor
const PAD_FT = 2;

const fmtArea = (n: number) =>
  `${Math.round(n).toLocaleString("en-IN")} sq ft`;

/**
 * A read-only, print-friendly rendering of a drawn floor plan — no
 * interaction, cropped to the drawn content so it fills its container. Safe to
 * render on the server (pure presentational). Returns null when nothing's
 * drawn so callers can omit the whole section.
 */
export function FloorPlanStatic({
  plan,
  className,
}: {
  plan: FloorPlanData;
  className?: string;
}) {
  const { rooms, openings } = plan;
  const allPts = [
    ...rooms.flatMap((r) => r.points),
    ...openings.map((o) => ({ x: o.x, y: o.y })),
  ];
  if (rooms.length === 0 || allPts.length === 0) return null;

  const minX = Math.min(...allPts.map((p) => p.x)) - PAD_FT;
  const minY = Math.min(...allPts.map((p) => p.y)) - PAD_FT;
  const maxX = Math.max(...allPts.map((p) => p.x)) + PAD_FT;
  const maxY = Math.max(...allPts.map((p) => p.y)) + PAD_FT;
  const vx = minX * PPF;
  const vy = minY * PPF;
  const vw = (maxX - minX) * PPF;
  const vh = (maxY - minY) * PPF;

  return (
    <svg
      viewBox={`${vx} ${vy} ${vw} ${vh}`}
      className={className}
      style={{ width: "100%", height: "auto" }}
      role="img"
      aria-label="Floor plan drawing"
    >
      <defs>
        <pattern id="fps-grid" width={PPF} height={PPF} patternUnits="userSpaceOnUse">
          <path
            d={`M ${PPF} 0 L 0 0 0 ${PPF}`}
            fill="none"
            stroke="rgba(31,31,31,0.06)"
            strokeWidth="1"
          />
        </pattern>
      </defs>

      <rect x={vx} y={vy} width={vw} height={vh} fill="#ffffff" />
      <rect x={vx} y={vy} width={vw} height={vh} fill="url(#fps-grid)" />

      {rooms.map((room) => {
        const pts = room.points.map((p) => `${p.x * PPF},${p.y * PPF}`).join(" ");
        const c = polygonCentroid(room.points);
        const area = polygonAreaSqFt(room.points);
        return (
          <g key={room.id}>
            <polygon
              points={pts}
              fill="rgba(102,112,90,0.13)"
              stroke="#1F1F1F"
              strokeWidth={4}
              strokeLinejoin="round"
            />
            <text
              x={c.x * PPF}
              y={c.y * PPF - 4}
              textAnchor="middle"
              style={{ paintOrder: "stroke", stroke: "#fff", strokeWidth: 4 }}
              fill="#1F1F1F"
              fontSize={15}
              fontWeight={600}
            >
              {room.name}
            </text>
            <text
              x={c.x * PPF}
              y={c.y * PPF + 14}
              textAnchor="middle"
              style={{ paintOrder: "stroke", stroke: "#fff", strokeWidth: 4 }}
              fill="#6b6b6b"
              fontSize={12}
            >
              {fmtArea(area)}
            </text>
          </g>
        );
      })}

      {openings.map((o) => {
        const color = o.kind === "door" ? "#B4523A" : "#66705A";
        return (
          <g key={o.id}>
            <circle cx={o.x * PPF} cy={o.y * PPF} r={11} fill="#fff" stroke={color} strokeWidth={2.5} />
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
  );
}
