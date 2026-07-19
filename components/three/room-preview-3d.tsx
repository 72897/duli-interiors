"use client";

import {
  Component,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  SoftShadows,
  ContactShadows,
  PerspectiveCamera,
} from "@react-three/drei";

/**
 * Procedural 3D room — floor, two walls, block furniture, window light.
 * Generated in code, so there are no paid/downloaded 3D assets and nothing to
 * 404. Used as the visual anchor across the authenticated product.
 *
 * Perf rules (R3F): DPR capped, animation via refs (never setState in
 * useFrame), lazy-mounted by the parent, Suspense-wrapped, WebGL fallback.
 */

export type RoomPalette = {
  floor: string;
  wall: string;
  accent: string;
  upholstery: string;
};

export const PALETTES: Record<string, RoomPalette> = {
  warm: { floor: "#9B6E4B", wall: "#F1EEE7", accent: "#B08D57", upholstery: "#D8D2C8" },
  olive: { floor: "#8A6A4A", wall: "#EDEBE4", accent: "#66705A", upholstery: "#C9C4BA" },
  luxe: { floor: "#6E5540", wall: "#E8E4DC", accent: "#B08D57", upholstery: "#3A3A38" },
  minimal: { floor: "#C9A227", wall: "#F8F7F4", accent: "#1F1F1F", upholstery: "#E8E4DC" },
};

function Sofa({ palette }: { palette: RoomPalette }) {
  return (
    <group position={[0, 0, 0.6]}>
      {/* base */}
      <mesh castShadow receiveShadow position={[0, 0.18, 0]}>
        <boxGeometry args={[2.2, 0.36, 0.9]} />
        <meshStandardMaterial color={palette.upholstery} roughness={0.85} />
      </mesh>
      {/* back */}
      <mesh castShadow position={[0, 0.52, -0.34]}>
        <boxGeometry args={[2.2, 0.62, 0.22]} />
        <meshStandardMaterial color={palette.upholstery} roughness={0.85} />
      </mesh>
      {/* arms */}
      {[-1.0, 1.0].map((x) => (
        <mesh key={x} castShadow position={[x, 0.42, 0]}>
          <boxGeometry args={[0.2, 0.44, 0.9]} />
          <meshStandardMaterial color={palette.upholstery} roughness={0.85} />
        </mesh>
      ))}
      {/* cushions */}
      {[-0.55, 0.55].map((x) => (
        <mesh key={x} castShadow position={[x, 0.4, 0.06]}>
          <boxGeometry args={[0.86, 0.14, 0.72]} />
          <meshStandardMaterial color={palette.wall} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function CoffeeTable({ palette }: { palette: RoomPalette }) {
  return (
    <group position={[0, 0, 1.9]}>
      <mesh castShadow receiveShadow position={[0, 0.34, 0]}>
        <boxGeometry args={[1.1, 0.06, 0.6]} />
        <meshStandardMaterial color={palette.accent} roughness={0.4} metalness={0.35} />
      </mesh>
      {[[-0.48, 0.24], [0.48, 0.24], [-0.48, -0.24], [0.48, -0.24]].map(([x, z], i) => (
        <mesh key={i} castShadow position={[x, 0.17, z]}>
          <cylinderGeometry args={[0.025, 0.025, 0.34, 12]} />
          <meshStandardMaterial color={palette.accent} metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

/** Fluted accent wall — the Duli signature detail, done procedurally. */
function FlutedWall({ palette }: { palette: RoomPalette }) {
  const slats = Array.from({ length: 18 }, (_, i) => -2.2 + i * 0.26);
  return (
    <group position={[0, 0, -1.6]}>
      <mesh receiveShadow position={[0, 1.4, 0]}>
        <boxGeometry args={[5, 2.8, 0.08]} />
        <meshStandardMaterial color={palette.wall} roughness={0.95} />
      </mesh>
      {slats.map((x) => (
        <mesh key={x} castShadow position={[x, 1.4, 0.08]}>
          <boxGeometry args={[0.1, 2.4, 0.08]} />
          <meshStandardMaterial color={palette.floor} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function SideWall({ palette }: { palette: RoomPalette }) {
  return (
    <group position={[-2.5, 0, 0]}>
      <mesh receiveShadow rotation={[0, Math.PI / 2, 0]} position={[0, 1.4, 0]}>
        <boxGeometry args={[3.2, 2.8, 0.08]} />
        <meshStandardMaterial color={palette.wall} roughness={0.95} />
      </mesh>
      {/* window opening — the light source motivation */}
      <mesh position={[0.06, 1.5, 0.5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.4, 1.2]} />
        <meshBasicMaterial color="#FFF6EA" toneMapped={false} />
      </mesh>
    </group>
  );
}

function Plant() {
  return (
    <group position={[1.85, 0, -0.9]}>
      <mesh castShadow position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.16, 0.12, 0.36, 16]} />
        <meshStandardMaterial color="#8C4A3A" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, 0.62, 0]} rotation={[0, 0.4, 0]}>
        <icosahedronGeometry args={[0.34, 1]} />
        <meshStandardMaterial color="#66705A" roughness={1} flatShading />
      </mesh>
    </group>
  );
}

function Rug({ palette }: { palette: RoomPalette }) {
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 1.4]}>
      <planeGeometry args={[3, 2]} />
      <meshStandardMaterial color={palette.wall} roughness={1} />
    </mesh>
  );
}

function Scene({ palette }: { palette: RoomPalette }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[5.2, 3.1, 6.2]} fov={38} />
      <SoftShadows size={28} samples={12} />

      <hemisphereLight intensity={0.5} groundColor="#c9c4ba" />
      {/* keylight standing in for the window */}
      <directionalLight
        position={[-4, 4.5, 2.5]}
        intensity={2.1}
        color="#FFF1DF"
        castShadow
        shadow-mapSize={[1024, 1024]}
      >
        <orthographicCamera attach="shadow-camera" args={[-6, 6, 6, -6, 0.1, 20]} />
      </directionalLight>
      <ambientLight intensity={0.35} />

      {/* floor */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[9, 9]} />
        <meshStandardMaterial color={palette.floor} roughness={0.6} metalness={0.05} />
      </mesh>

      <Rug palette={palette} />
      <FlutedWall palette={palette} />
      <SideWall palette={palette} />
      <Sofa palette={palette} />
      <CoffeeTable palette={palette} />
      <Plant />

      <ContactShadows position={[0, 0.02, 0]} opacity={0.45} scale={12} blur={2.6} far={4} />
      {/* No <Environment preset> on purpose: drei fetches an HDR from an
          external CDN, which suspends forever if blocked. Lit locally instead —
          nothing here touches the network. */}
      <pointLight position={[2.5, 2.2, 2.5]} intensity={18} color="#FFE9CF" distance={12} decay={2} />
      {/* The room only has two walls, so the camera must stay on the open
          (+x/+z) side — otherwise you orbit behind the walls and see their
          backs. Azimuth is clamped to the open quadrant; no autoRotate for the
          same reason. */}
      <OrbitControls
        enablePan={false}
        minPolarAngle={0.7}
        maxPolarAngle={Math.PI / 2.3}
        minAzimuthAngle={-Math.PI / 10}
        maxAzimuthAngle={Math.PI / 2.2}
        minDistance={5.5}
        maxDistance={10}
        enableDamping
        dampingFactor={0.06}
        target={[0, 0.9, 0.2]}
      />
    </>
  );
}

/** Rendered when WebGL is unavailable — never a blank grey box. */
function Fallback() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone/40 to-blush/40">
      <p className="px-6 text-center text-[12.5px] text-muted">
        3D preview needs WebGL — your browser or device has it disabled.
      </p>
    </div>
  );
}

/**
 * Isolates a WebGL/Canvas crash to the 3D area. Without this, R3F throwing
 * during context init (common on mobile / low-power GPUs) bubbles to the app
 * error boundary and takes down the WHOLE page — which is what "the 3D studio
 * didn't load" was. Now the room just falls back to a graceful panel.
 */
class CanvasBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function RoomPreview3D({
  palette = "warm",
  className = "",
}: {
  palette?: keyof typeof PALETTES;
  className?: string;
}) {
  const [ready, setReady] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const p = PALETTES[palette] ?? PALETTES.warm;

  // Mount the Canvas only once the box has a real, non-zero size. R3F's own
  // measure (react-use-measure) is flaky inside a dynamically-imported
  // percentage/flex container — it can read 0 on first paint and never
  // recover, leaving the canvas stuck at its 300x150 default. Gating the mount
  // on a measured size sidesteps that: by the time <Canvas> mounts, its parent
  // already has dimensions, so the measure is correct.
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const check = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) setReady(true);
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Once the Canvas has mounted, force R3F to re-measure against the laid-out
  // parent. react-use-measure can latch onto a 0 initial size in this
  // dynamically-imported container and never recover (canvas stuck at 300x150);
  // a resize tick fixes it. A single rAF is too early — the observer hasn't
  // fired yet — so nudge a couple of times over the first ~300ms. Verified fix.
  useEffect(() => {
    if (!ready) return;
    const timers = [80, 300].map((d) =>
      window.setTimeout(() => window.dispatchEvent(new Event("resize")), d),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [ready]);

  return (
    <div ref={boxRef} className={className}>
      {ready && (
        <CanvasBoundary fallback={<Fallback />}>
          <Canvas
            shadows
            // Default frameloop is correct here — frameloop="demand" drew once
            // before measuring and left a 300x150 canvas. DPR cap keeps cost down
            // (retina/mobile would otherwise render ~4x the pixels).
            dpr={[1, 1.6]}
            gl={{ antialias: true, powerPreference: "high-performance" }}
            onCreated={({ gl }) => gl.setClearColor("#F8F7F4", 0)}
            style={{ width: "100%", height: "100%" }}
          >
            <Suspense fallback={null}>
              <Scene palette={p} />
            </Suspense>
          </Canvas>
        </CanvasBoundary>
      )}
    </div>
  );
}
