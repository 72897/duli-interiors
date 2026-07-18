"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Workspace tabs. Real sub-routes rather than client state, so every tab is a
 * linkable URL, survives a refresh, and renders on the server.
 */
const TABS = [
  { seg: "", label: "Overview" },
  { seg: "floor-plan", label: "Floor Plan" },
  { seg: "ai-designs", label: "AI Designs" },
  { seg: "3d-preview", label: "3D Preview" },
  { seg: "catalog", label: "Catalog" },
  { seg: "estimate", label: "Estimate" },
  { seg: "comments", label: "Comments" },
  { seg: "files", label: "Files" },
];

export function ProjectTabs({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const base = `/projects/${projectId}`;

  return (
    <nav
      aria-label="Project workspace"
      className="mt-5 flex gap-1 overflow-x-auto rounded-full border border-white/60 bg-white/70 p-2 backdrop-blur-xl"
    >
      {TABS.map((t) => {
        const href = t.seg ? `${base}/${t.seg}` : base;
        // Overview is the base path, so it must match exactly or it would
        // light up on every tab.
        const active = pathname === href;
        return (
          // scroll={false}: switching tabs shouldn't yank you back to the top.
          <Link
            key={t.seg || "overview"}
            href={href}
            scroll={false}
            aria-current={active ? "page" : undefined}
            className={
              "shrink-0 cursor-pointer rounded-full px-4 py-2.5 text-[13.5px] font-semibold transition-colors duration-200 " +
              (active
                ? "bg-ink text-bg"
                : "text-ink/75 hover:bg-ink/[0.06] hover:text-ink")
            }
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
