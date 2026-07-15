"use client";

import { useEffect, useRef, useState } from "react";
import { SplitText } from "@/components/split-text";

export function AIDesignTagline() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={"ai-tagline" + (inView ? " in-view" : "")} ref={ref}>
      <h2 className="ai-tagline-text">
        <SplitText text="See It. Estimate It. Build It." />
      </h2>
    </section>
  );
}
