import type { Metadata } from "next";
import { Move3d, Palette, Ruler } from "lucide-react";
import { PageHead, Panel, MockNotice } from "@/components/app-ui";
import { RoomSceneCard } from "@/components/three/room-scene-card";
import { ModelShowcase } from "@/components/model-showcase";

export const metadata: Metadata = { title: "3D Studio — Duli Interiors" };

const HINTS = [
  {
    icon: Move3d,
    title: "Orbit and inspect",
    body: "Drag to rotate, scroll to zoom. Judge proportion from any angle instead of one flattering photo.",
  },
  {
    icon: Palette,
    title: "Materials",
    body: "Switch the finish live — pick a swatch and the room re-materialises. Per-item catalog pricing follows.",
  },
  {
    icon: Ruler,
    title: "True scale",
    body: "The room and its furniture are built to real dimensions, so what you see is what fits.",
  },
];

export default function ThreeDStudioPage() {
  return (
    <div>
      <PageHead
        eyebrow="Design"
        title="3D Studio"
        intro="Walk the space before it's built — orbit the room, switch materials, and judge the proportions at true scale."
      />

      <MockNotice>
        A procedurally-built reference room. Per-project models — your actual
        rooms — arrive with the floor planner.
      </MockNotice>

      {/* Interactive room with a live material selector (spec §7). */}
      <Panel className="overflow-hidden p-2">
        <RoomSceneCard
          className="h-[460px] w-full rounded-[14px]"
          title="Live 3D room"
          subtitle="Drag to orbit · pick a material"
        />
      </Panel>

      {/* A real product model too — model-viewer, no WebGL context needed. */}
      <Panel className="mt-5 overflow-hidden p-2">
        <ModelShowcase className="h-[340px] w-full rounded-[14px]" />
      </Panel>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {HINTS.map((h) => {
          const Icon = h.icon;
          return (
            <Panel key={h.title} className="p-5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brass/12 text-brass ring-1 ring-brass/20">
                <Icon size={17} strokeWidth={1.8} />
              </span>
              <p className="mt-3 text-[14.5px] font-semibold">{h.title}</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
                {h.body}
              </p>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
