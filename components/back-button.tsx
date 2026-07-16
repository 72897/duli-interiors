"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPortalRoot } from "@/lib/portal-root";

/**
 * Universal back button — fixed top-left, on every page (rendered inside the
 * site header, which is everywhere). Uses browser history so it returns wherever
 * you came from. Hidden on the very first entry (nothing to go back to) and on
 * the home page, and when printing.
 */
export function BackButton() {
  const router = useRouter();
  const pathname = usePathname();
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    setRoot(getPortalRoot());
    // history.length > 1 means there's a previous entry in this tab's stack.
    setCanGoBack(window.history.length > 1);
  }, [pathname]);

  if (!root || !canGoBack || pathname === "/") return null;

  // Portal into the shared persistent root (not document.body): the header uses
  // a transform, so a `fixed` child of it positions relative to the header, not
  // the viewport. The isolated root also avoids the removeChild race that
  // portaling into body hits when the header unmounts during navigation.
  return createPortal(
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="Go back"
      className="fixed left-4 top-5 z-[130] grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-white/60 bg-white/80 text-ink shadow-[0_10px_30px_-12px_rgba(31,31,31,0.5)] backdrop-blur-xl transition-colors duration-200 hover:bg-white print:hidden"
    >
      <ArrowLeft size={18} strokeWidth={2} />
    </button>,
    root,
  );
}
