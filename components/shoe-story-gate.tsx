"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const DynamicShoeStory = dynamic(
  () => import("@/components/shoe-scroll-story").then((module) => module.ShoeScrollStory),
  { ssr: false, loading: () => <ShoeStoryPlaceholder /> },
);

function ShoeStoryPlaceholder() {
  return (
    <section className="shoe-story shoe-story-placeholder" aria-hidden="true">
      <div className="shoe-story-sticky">
        <span>۳۶۰°</span>
      </div>
    </section>
  );
}

export function ShoeStoryGate() {
  const triggerRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setActive(true);
        observer.disconnect();
      }
    }, { rootMargin: "0px 0px -35% 0px" });
    observer.observe(trigger);
    return () => observer.disconnect();
  }, []);

  if (active) return <DynamicShoeStory />;
  return (
    <section ref={triggerRef} className="shoe-story shoe-story-placeholder" aria-hidden="true">
      <div className="shoe-story-sticky">
        <span>۳۶۰°</span>
      </div>
    </section>
  );
}
