"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export function ScrollEngine() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // GSAP's ScrollTrigger registry is a global, not scoped to this component —
    // across dev-server hot-reloads it's possible for a stale trigger from a
    // previous edit (e.g. an old un-pinned scrub) to still be registered
    // alongside the current one, fighting it. Clear the slate every mount.
    ScrollTrigger.getAll().forEach((t) => t.kill());

    // The browser's own scroll-restoration can fight Lenis on first load (e.g.
    // after a refresh), jumping the scroll position right as Lenis/ScrollTrigger
    // are establishing their initial state — this is a common cause of the page
    // feeling like it scrolls the wrong way for the first couple of ticks.
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    // Skip the forced reset when arriving via a hash deep link (e.g. another
    // page's "Contact Us" linking to "/#contact") — otherwise this would wipe
    // out the browser's anchor-scroll before the user ever sees it.
    if (!window.location.hash) window.scrollTo(0, 0);

    // lerp controls how much the scroll position "coasts" after input stops —
    // 0.1 (Lenis's typical demo default) leaves a noticeable glide, which makes
    // any scrub-tied animation look like it's auto-playing on its own for a
    // moment after you stop scrolling. Higher = snappier, less coast.
    const lenis = new Lenis({ lerp: 0.45, smoothWheel: true });
    lenisRef.current = lenis;

    const raf = (time: number) => lenis.raf(time * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const triggers: ScrollTrigger[] = [];

    // Hero pins in place while the statement section scrolls up over it.
    const hero = document.getElementById("hero");
    if (hero) {
      triggers.push(
        ScrollTrigger.create({ trigger: hero, start: "top top", end: "+=100%", pin: true, pinSpacing: true, anticipatePin: 1 })
      );
    }

    // "Designed Around Real Life" — scroll-scrubbed storytelling section (no pin).
    const realLifeSection = document.querySelector<HTMLElement>(".real-life-section");
    let onRealLifeResize: (() => void) | undefined;

    if (realLifeSection) {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const heading = realLifeSection.querySelector<HTMLElement>(".real-life-heading");
      const lines = realLifeSection.querySelectorAll<HTMLElement>(".real-life-line");
      const row = realLifeSection.querySelector<HTMLElement>(".real-life-row");
      const svg = realLifeSection.querySelector<SVGSVGElement>(".real-life-line-svg");
      const path = document.getElementById("real-life-path") as SVGPathElement | null;
      const items = realLifeSection.querySelectorAll<HTMLElement>(".real-life-item");
      const icons = realLifeSection.querySelectorAll<HTMLElement>(".real-life-icon");

      if (reduceMotion) {
        gsap.set(heading, { opacity: 1, y: 0 });
        gsap.set(items, { opacity: 1, y: 0 });
        gsap.set(lines, { clipPath: "inset(0 0 0% 0)" });
      } else if (window.matchMedia("(min-width: 901px)").matches && row && svg && path && icons.length >= 2) {
        // Path is rebuilt from real icon positions so it threads exactly through
        // each icon's base, ending in a decorative loop around the last one.
        // buildPath also returns, for each icon, the fraction along the path's
        // length where the line reaches that icon — used to time each milestone's
        // reveal to the exact moment the drawing line arrives at it.
        const buildPath = () => {
          const rowRect = row.getBoundingClientRect();
          const W = rowRect.width;
          const Y = icons[0].getBoundingClientRect().height - 6;
          const amp = 16;
          const svgH = Y + amp * 3 + 10;
          const centers = Array.from(icons).map((icon) => {
            const r = icon.getBoundingClientRect();
            return r.left + r.width / 2 - rowRect.left;
          });
          svg.setAttribute("viewBox", `0 0 ${W} ${svgH}`);
          svg.style.height = `${svgH}px`;
          let d = `M${centers[0]},${Y}`;
          for (let i = 0; i < centers.length - 1; i++) {
            const x0 = centers[i];
            const x1 = centers[i + 1];
            const dir = i % 2 === 0 ? -1 : 1;
            d += ` C${x0 + (x1 - x0) / 3},${Y + dir * amp} ${x0 + ((x1 - x0) * 2) / 3},${Y + dir * amp} ${x1},${Y}`;
          }
          const lastX = centers[centers.length - 1];
          d += ` C${lastX + amp * 2.4},${Y - amp * 2} ${lastX + amp * 2.8},${Y + amp * 1.6} ${lastX + amp * 0.4},${Y + amp * 0.5}`;
          d += ` C${lastX - amp * 1.8},${Y - amp * 0.4} ${lastX - amp * 0.3},${Y - amp * 2.4} ${lastX},${Y}`;
          path.setAttribute("d", d);
          const length = path.getTotalLength();
          gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });

          const samples = 400;
          const fractions: number[] = [];
          let sampleIdx = 0;
          for (let i = 0; i < centers.length; i++) {
            let found = length;
            for (; sampleIdx <= samples; sampleIdx++) {
              const len = (sampleIdx / samples) * length;
              if (path.getPointAtLength(len).x >= centers[i]) {
                found = len;
                break;
              }
            }
            fractions.push(found / length);
          }
          return fractions;
        };

        let fractions = buildPath();
        onRealLifeResize = () => {
          fractions = buildPath();
        };
        window.addEventListener("resize", onRealLifeResize);

        // Heading + paragraph lines reveal early, while the section is still
        // scrolling up into place from below — tied to its own (non-pinned)
        // scrub so the text doesn't wait for the pin to fully engage before
        // it starts appearing.
        const introTl = gsap.timeline({
          scrollTrigger: { trigger: realLifeSection, start: "top 95%", end: "top top", scrub: true }
        });
        introTl
          .to(heading, { opacity: 1, y: 0, duration: 1 })
          .to(lines, { clipPath: "inset(0 0 0% 0)", duration: 0.6, stagger: 0.12 }, "-=0.3");
        if (introTl.scrollTrigger) triggers.push(introTl.scrollTrigger);

        // Pinned: the section stays fixed at exactly one viewport while extra
        // scroll plays out the rest of the reveal (the drawn line + icons) —
        // the section's own CSS height never changes, only the time spent
        // looking at it does. Pinning also makes overlap with the next
        // section structurally impossible: nothing below this section can
        // scroll into view until the pin itself releases, which only happens
        // once this scrub timeline has reached progress 1.
        const tl = gsap.timeline({
          scrollTrigger: { trigger: realLifeSection, start: "top top", end: "+=70%", scrub: true, pin: true, anticipatePin: 1 }
        });
        const pathDrawDuration = 1.1;
        tl.to(path, { strokeDashoffset: 0, duration: pathDrawDuration, ease: "none" });
        const pathDrawStart = tl.duration() - pathDrawDuration;
        items.forEach((item, i) => {
          const at = Math.max(0, pathDrawStart + fractions[i] * pathDrawDuration - 0.1);
          tl.to(item, { opacity: 1, y: 0, duration: 0.3 }, at);
        });
        // Hold the fully-revealed state briefly before the pin releases — just
        // enough buffer that the next section never appears before everything
        // has visibly settled, without making text wait through a long scroll.
        tl.to({}, { duration: 1.5 });
        if (tl.scrollTrigger) triggers.push(tl.scrollTrigger);
      } else if (row && svg && path && icons.length >= 2) {
        // Mobile — same drawn-line storytelling as desktop, just re-oriented:
        // items stack in one column (see CSS), so the path threads vertically
        // through each icon's center instead of horizontally, swaying left/right
        // for the same hand-drawn feel. Scroll-scrubbed but NOT pinned — mobile
        // scroll distance is precious, so the section just plays out normally
        // as it passes through the viewport instead of commandeering the scroll.
        gsap.set(lines, { clipPath: "inset(0 0 0% 0)" });

        const buildVerticalPath = () => {
          const rowRect = row.getBoundingClientRect();
          const cx = rowRect.width / 2;
          const amp = Math.min(34, rowRect.width * 0.16);
          const centers = Array.from(icons).map((icon) => {
            const r = icon.getBoundingClientRect();
            return r.top + r.height / 2 - rowRect.top;
          });
          const H = Math.max(...centers) + 40;
          svg.setAttribute("viewBox", `0 0 ${rowRect.width} ${H}`);
          svg.style.height = `${H}px`;
          let d = `M${cx},${centers[0]}`;
          for (let i = 0; i < centers.length - 1; i++) {
            const y0 = centers[i];
            const y1 = centers[i + 1];
            const dir = i % 2 === 0 ? 1 : -1;
            d += ` C${cx + dir * amp},${y0 + (y1 - y0) / 3} ${cx - dir * amp},${y0 + ((y1 - y0) * 2) / 3} ${cx},${y1}`;
          }
          path.setAttribute("d", d);
          const length = path.getTotalLength();
          gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });

          const samples = 400;
          const fractions: number[] = [];
          let sampleIdx = 0;
          for (let i = 0; i < centers.length; i++) {
            let found = length;
            for (; sampleIdx <= samples; sampleIdx++) {
              const len = (sampleIdx / samples) * length;
              if (path.getPointAtLength(len).y >= centers[i]) {
                found = len;
                break;
              }
            }
            fractions.push(found / length);
          }
          return fractions;
        };

        let fractions = buildVerticalPath();
        onRealLifeResize = () => {
          fractions = buildVerticalPath();
        };
        window.addEventListener("resize", onRealLifeResize);

        const tl = gsap.timeline({
          scrollTrigger: { trigger: realLifeSection, start: "top 80%", end: "bottom 55%", scrub: true }
        });
        const pathDrawDuration = 1.4;
        tl.to(heading, { opacity: 1, y: 0, duration: 0.3 })
          .to(path, { strokeDashoffset: 0, duration: pathDrawDuration, ease: "none" }, 0.2);
        const pathDrawStart = 0.2;
        items.forEach((item, i) => {
          const at = Math.max(0, pathDrawStart + fractions[i] * pathDrawDuration - 0.08);
          tl.to(item, { opacity: 1, y: 0, duration: 0.25 }, at);
        });
        if (tl.scrollTrigger) triggers.push(tl.scrollTrigger);
      } else {
        // Fallback for the rare case the icons/path markup isn't present.
        gsap.set(lines, { clipPath: "inset(0 0 0% 0)" });
        ScrollTrigger.create({
          trigger: realLifeSection,
          start: "top 85%",
          once: true,
          onEnter: () => {
            gsap.to(heading, { opacity: 1, y: 0, duration: 0.7 });
            gsap.to(items, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, delay: 0.15 });
          }
        });
      }
    }

    // Project images cross-fade in a single pinned scene — created *after* the
    // Real Life trigger above (even though both are read top-to-bottom in this
    // file in the order they used to run) because Real Life's pin, on desktop,
    // inserts a spacer that reserves an extra 140% of viewport height right
    // before this section. If this trigger were created first, GSAP would
    // measure its document position before that spacer exists, putting its
    // pin "start" ~140vh too early — which on desktop let scroll progress race
    // ahead of where it visually should be (this section's last cross-fade
    // frame appearing immediately, then a blank gap through the spacer's dead
    // zone before the now-unpinned content reappeared at its real position).
    // Mobile never showed this because Real Life never pins there.
    const stage = document.querySelector<HTMLElement>(".project-scene-stage");
    const layers = document.querySelectorAll<HTMLElement>(".project-scene-layer");
    if (stage && layers.length === 3) {
      gsap.set(layers[1], { opacity: 0 });
      gsap.set(layers[2], { opacity: 0 });
      const tl = gsap.timeline({
        scrollTrigger: { trigger: stage, start: "top top", end: "+=200%", scrub: true, pin: true, anticipatePin: 1 }
      });
      tl.to(layers[0], { opacity: 0, duration: 1 }, 1)
        .to(layers[1], { opacity: 1, duration: 1 }, 1)
        .to(layers[1], { opacity: 0, duration: 1 }, 2)
        .to(layers[2], { opacity: 1, duration: 1 }, 2);
      if (tl.scrollTrigger) triggers.push(tl.scrollTrigger);
    }

    // Bottom-right scroll-progress ring.
    const bar = document.getElementById("scroll-progress-bar");
    if (bar) {
      const r = 24;
      const circumference = 2 * Math.PI * r;
      gsap.set(bar, { strokeDasharray: circumference, strokeDashoffset: circumference });
      triggers.push(
        ScrollTrigger.create({
          trigger: document.documentElement,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => gsap.set(bar, { strokeDashoffset: circumference * (1 - self.progress) })
        })
      );
    }

    // Defer the first refresh a frame so it measures against a settled layout
    // rather than the instant this effect happens to run (which can land before
    // the browser's first paint after hydration) — refreshing too early is what
    // produces a wrong initial pin boundary for the hero, felt as a brief
    // backwards/wrong-direction jump on the first couple of scroll ticks.
    const refresh = () => ScrollTrigger.refresh();
    requestAnimationFrame(() => requestAnimationFrame(refresh));

    // Pinned sections (hero/real-life/project-scene above) insert spacer divs
    // that push everything below them further down the document — that
    // happens synchronously above, after the browser already did its native
    // jump to any "#hash" in the URL (e.g. landing on "/#contact" from another
    // page), so the target has since moved and the page is now scrolled to
    // the wrong spot. Re-sync once layout has settled.
    let hashRetryTimers: ReturnType<typeof setTimeout>[] = [];
    let scrollToHash: (() => void) | undefined;
    if (window.location.hash) {
      const hashTarget = document.querySelector(window.location.hash);
      if (hashTarget) {
        scrollToHash = () => lenis.scrollTo(hashTarget as HTMLElement, { immediate: true });
        // A single double-RAF re-sync isn't reliable enough for a fresh
        // cross-page navigation (e.g. clicking "Contact Us" from /about) —
        // that's a full page load, not a same-page hash jump, so there's a
        // lot more still settling (Lenis construction, the hero/project-scene
        // pin-spacers being inserted, this very effect's other setup above)
        // than there is for a same-page click, which is why the first click
        // from another page lands at the top while a second click (now a
        // same-page hash jump the browser handles natively) works fine.
        // Retrying at a few staggered times covers whichever stage of that
        // settling actually still needs to finish.
        requestAnimationFrame(() => requestAnimationFrame(scrollToHash as () => void));
        window.addEventListener("load", scrollToHash, { once: true });
        hashRetryTimers = [setTimeout(scrollToHash, 350), setTimeout(scrollToHash, 900)];
      }
    }

    // The Playfair Display webfont finishing its swap can still change layout
    // (different font metrics reflow normal-flow sections like Statement/footer),
    // so one re-measure once it's ready is worth it. Image loads are deliberately
    // NOT hooked here anymore: every image in this codebase sits in a fixed-size,
    // absolutely-positioned container, so loading them never changes any section's
    // height — but refresh() firing while a user is mid-scroll through a pinned
    // section recalculates that pin's boundaries against the current scroll
    // position, which can release the pin early. Since image loads buy us no
    // correctness here, they're not worth that risk.
    // Only refresh for the font swap if the user hasn't scrolled far yet — once
    // they're already inside a pinned section, recalculating its start/end
    // against the post-swap layout can put the current scroll position past
    // the new "end", which clamps that section's scrub timeline straight to
    // progress 1 (e.g. snapping the project cross-fade to its last frame).
    document.fonts?.ready?.then(() => {
      if (window.scrollY < window.innerHeight * 1.5) refresh();
    });

    return () => {
      triggers.forEach((t) => t.kill());
      if (onRealLifeResize) window.removeEventListener("resize", onRealLifeResize);
      if (scrollToHash) window.removeEventListener("load", scrollToHash);
      hashRetryTimers.forEach((id) => clearTimeout(id));
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return (
    <>
      <a
        href="#"
        id="scroll-progress"
        aria-label="Scroll down"
        onClick={(e) => {
          e.preventDefault();
          lenisRef.current?.scrollTo(window.scrollY + window.innerHeight, { duration: 1.2 });
        }}
      >
        <svg viewBox="0 0 56 56" width="56" height="56">
          <circle className="scroll-progress-track" cx="28" cy="28" r="24" />
          <circle id="scroll-progress-bar" cx="28" cy="28" r="24" />
        </svg>
        <span className="scroll-progress-arrow">↓</span>
      </a>
    </>
  );
}
