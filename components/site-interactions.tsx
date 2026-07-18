"use client";

import { useEffect } from "react";

export function CustomCursor() {
  return <div id="cursor" />;
}

export function SiteInteractions() {
  useEffect(() => {
    // ── Header scroll ──
    const header = document.getElementById("header");
    const parallaxEls = document.querySelectorAll<HTMLElement>("[data-parallax]");
    let lastScrollY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      header?.classList.toggle("scrolled", y > window.innerHeight * 0.6);
      // Hide the floating pill the moment you scroll down past the very top
      // (it otherwise sits on top of page headings/the estimator's stepper),
      // and bring it straight back on the smallest upward scroll — so it's
      // never competing with content but is always one swipe-up away.
      const delta = y - lastScrollY;
      if (y < 80) header?.classList.remove("header-hidden");
      else if (delta > 4) header?.classList.add("header-hidden");
      else if (delta < -4) header?.classList.remove("header-hidden");
      lastScrollY = y;
      // The hero's background no longer parallaxes off raw scrollY here — the
      // hero is pinned in scroll-engine.tsx for the first viewport-height of
      // scroll, and this effect (unaware of that pin) was sliding the image
      // far enough to expose the section's own background color at the top.
      parallaxEls.forEach((el) => {
        const rect = el.parentElement!.getBoundingClientRect();
        const center = rect.top + rect.height / 2 - window.innerHeight / 2;
        const off = Math.max(-1, Math.min(1, -center / window.innerHeight)) * 56;
        el.style.transform = "translate3d(0," + off + "px,0) scale(1.04)";
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // ── Hide the floating scroll button once the footer is reachable ──
    // It's a "scroll further down" affordance, so it stops making sense (and
    // stops risking sitting on top of footer links/CTAs) the moment there's
    // nowhere further down to go.
    const footer = document.querySelector<HTMLElement>(".site-footer");
    let footerIO: IntersectionObserver | undefined;
    if (footer) {
      footerIO = new IntersectionObserver(
        ([entry]) => document.body.classList.toggle("near-footer", entry.isIntersecting),
        { threshold: 0 }
      );
      footerIO.observe(footer);
    }

    // ── Reveal on scroll ──
    const revealEls = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const revealIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          const delay = parseInt(el.dataset.delay || "0");
          setTimeout(() => el.classList.add("visible"), delay);
          revealIO.unobserve(el);
        });
      },
      { threshold: 0, rootMargin: "200px 0px -6% 0px" }
    );
    revealEls.forEach((el) => revealIO.observe(el));

    // ── Animated counters ──
    const countEls = document.querySelectorAll<HTMLElement>("[data-count]");
    const countIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          const target = parseFloat(el.dataset.count || "0") || 0;
          const suffix = el.dataset.suffix || "";
          const dur = 1800;
          const start = performance.now();
          const step = (now: number) => {
            const p = Math.min(1, (now - start) / dur);
            const ease = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * ease) + suffix;
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          countIO.unobserve(el);
        });
      },
      { threshold: 0.55 }
    );
    countEls.forEach((el) => countIO.observe(el));

    // ── Live clocks (IST) ──
    const mum = document.getElementById("clock-mum");
    const del = document.getElementById("clock-del");
    const blr = document.getElementById("clock-blr");
    const updateClocks = () => {
      const t = new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Kolkata"
      });
      if (mum) mum.textContent = t;
      if (del) del.textContent = t;
      if (blr) blr.textContent = t;
    };
    updateClocks();
    const clockInterval = setInterval(updateClocks, 10000);

    // ── Hero cycle text ──
    const cycleEl = document.getElementById("hero-cycle");
    const cycleItems = ["transparency", "honesty", "craftsmanship", "accountability"];
    let cycleIdx = 0;
    let cycleInterval: ReturnType<typeof setInterval> | undefined;
    if (cycleEl) {
      cycleInterval = setInterval(() => {
        cycleEl.style.transition = "opacity .5s ease,transform .5s ease";
        cycleEl.style.opacity = "0";
        cycleEl.style.transform = "translateY(-10px)";
        setTimeout(() => {
          cycleIdx = (cycleIdx + 1) % cycleItems.length;
          cycleEl.textContent = cycleItems[cycleIdx];
          cycleEl.style.transform = "translateY(10px)";
          requestAnimationFrame(() => {
            cycleEl.style.transition = "opacity .7s ease,transform .7s cubic-bezier(.16,1,.3,1)";
            cycleEl.style.opacity = "1";
            cycleEl.style.transform = "translateY(0)";
          });
        }, 520);
      }, 3200);
    }

    // ── Custom cursor ──
    const cursor = document.getElementById("cursor");
    let loopId: number | undefined;
    let onMouseMove: ((e: MouseEvent) => void) | undefined;
    let onMouseOver: ((e: MouseEvent) => void) | undefined;
    let onMouseOut: ((e: MouseEvent) => void) | undefined;
    if (cursor && window.matchMedia("(hover:hover) and (pointer:fine)").matches) {
      let x = innerWidth / 2;
      let y = innerHeight / 2;
      let cx = x;
      let cy = y;
      onMouseMove = (e) => {
        x = e.clientX;
        y = e.clientY;
      };
      window.addEventListener("mousemove", onMouseMove);
      const loop = () => {
        cx += (x - cx) * 0.15;
        cy += (y - cy) * 0.15;
        cursor.style.transform = "translate(" + (cx - cursor.offsetWidth / 2) + "px," + (cy - cursor.offsetHeight / 2) + "px)";
        loopId = requestAnimationFrame(loop);
      };
      loop();
      const sel = "a,button,input";
      onMouseOver = (e) => {
        if ((e.target as HTMLElement).closest?.(sel)) {
          cursor.style.width = "48px";
          cursor.style.height = "48px";
        }
      };
      onMouseOut = (e) => {
        if ((e.target as HTMLElement).closest?.(sel)) {
          cursor.style.width = "12px";
          cursor.style.height = "12px";
        }
      };
      document.addEventListener("mouseover", onMouseOver);
      document.addEventListener("mouseout", onMouseOut);
    } else if (cursor) {
      cursor.style.display = "none";
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      footerIO?.disconnect();
      document.body.classList.remove("near-footer");
      revealIO.disconnect();
      countIO.disconnect();
      clearInterval(clockInterval);
      if (cycleInterval) clearInterval(cycleInterval);
      if (loopId) cancelAnimationFrame(loopId);
      if (onMouseMove) window.removeEventListener("mousemove", onMouseMove);
      if (onMouseOver) document.removeEventListener("mouseover", onMouseOver);
      if (onMouseOut) document.removeEventListener("mouseout", onMouseOut);
    };
  }, []);

  return null;
}
