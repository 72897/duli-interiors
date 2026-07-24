import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Backs the in-browser overlay calibration tool in space-estimator.tsx
// ("Edit Position" → drag/resize → "Fix This Position"). Writes the new
// bottom/width/left percentages directly into lib/estimator-data.ts for the
// given item — never available outside local development.
const DATA_FILE = path.join(process.cwd(), "lib", "estimator-data.ts");

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available outside development" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const itemId = body?.itemId;
  const overlay = body?.overlay;
  const field = body?.field === "overlayMobile" ? "overlayMobile" : "overlay";
  if (
    typeof itemId !== "string" ||
    typeof overlay?.bottom !== "number" ||
    typeof overlay?.width !== "number" ||
    typeof overlay?.left !== "number"
  ) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const source = await fs.readFile(DATA_FILE, "utf-8");

  const rotateX = typeof overlay.rotateX === "number" ? round1(overlay.rotateX) : 0;
  const rotateY = typeof overlay.rotateY === "number" ? round1(overlay.rotateY) : 0;
  const rotateZ = typeof overlay.rotateZ === "number" ? round1(overlay.rotateZ) : 0;
  const rotateParts = [
    rotateX !== 0 ? `rotateX: ${rotateX}` : null,
    rotateY !== 0 ? `rotateY: ${rotateY}` : null,
    rotateZ !== 0 ? `rotateZ: ${rotateZ}` : null
  ].filter(Boolean);
  const rotatePart = rotateParts.length > 0 ? `, ${rotateParts.join(", ")}` : "";
  const replacement = `{ bottom: ${round1(overlay.bottom)}, width: ${round1(overlay.width)}, left: ${round1(overlay.left)}${rotatePart} }`;

  // If this item already has its own `field:` property, just replace its
  // value in place — same as the original desktop-only behavior.
  const existingPattern = new RegExp(`(id:\\s*"${escapeRegExp(itemId)}"[\\s\\S]*?${field}:\\s*)(BED_OVERLAY|\\{[^}]*\\})`);
  let updated: string;
  if (existingPattern.test(source)) {
    updated = source.replace(existingPattern, (_match, prefix: string) => `${prefix}${replacement}`);
  } else if (field === "overlayMobile") {
    // No overlayMobile yet for this item — insert a new property right after
    // its existing `overlay:` value instead of overwriting it.
    const overlayPattern = new RegExp(`id:\\s*"${escapeRegExp(itemId)}"[\\s\\S]*?overlay:\\s*(?:BED_OVERLAY|\\{[^}]*\\})`);
    const match = overlayPattern.exec(source);
    if (!match) {
      return NextResponse.json({ error: `Could not find an overlay for item "${itemId}"` }, { status: 404 });
    }
    const insertAt = match.index + match[0].length;
    updated = `${source.slice(0, insertAt)},\n            overlayMobile: ${replacement}${source.slice(insertAt)}`;
  } else {
    return NextResponse.json({ error: `Could not find an overlay for item "${itemId}"` }, { status: 404 });
  }

  await fs.writeFile(DATA_FILE, updated, "utf-8");

  // Read it back to confirm the new value actually landed on disk — if this
  // ever fails, the problem is downstream (dev-server/browser caching, not
  // this write), which matters for diagnosing "it reverted later" reports.
  const verify = await fs.readFile(DATA_FILE, "utf-8");
  if (!verify.includes(replacement)) {
    return NextResponse.json({ error: "Write didn't verify on disk — try again" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
