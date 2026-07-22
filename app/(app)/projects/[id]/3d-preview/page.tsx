import type { Metadata } from "next";
import { requireProject } from "@/lib/projects/workspace";
import { RoomSceneCard } from "@/components/three/room-scene-card";
import { Panel, MockNotice } from "@/components/app-ui";

export const metadata: Metadata = { title: "3D Preview — Duli Interiors" };

export default async function ProjectThreeDPage({
  params,
}: {
  params: { id: string };
}) {
  await requireProject(params.id);

  return (
    <div className="space-y-5">
      <MockNotice>
        A reference model, not your room. Per-project 3D arrives once the floor
        planner can build geometry from your plan.
      </MockNotice>

      <Panel className="overflow-hidden p-2">
        {/* Interactive room with a live material selector. Renders a WebGL
            fallback panel when the device has no WebGL (spec §4). */}
        <RoomSceneCard
          className="h-[460px] w-full rounded-[14px]"
          title="3D preview"
          subtitle="Drag to orbit · pick a material"
        />
      </Panel>

      <Panel className="border-dashed p-6">
        <p className="text-[15px] font-semibold text-muted">Coming to 3D preview</p>
        <p className="mt-1.5 max-w-[62ch] text-[12.5px] leading-relaxed text-muted">
          Material and lighting selectors, a day/night toggle, render snapshots
          and fullscreen — all driven by your actual room once the plan is
          traced.
        </p>
      </Panel>
    </div>
  );
}
