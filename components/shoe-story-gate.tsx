"use client";

import dynamic from "next/dynamic";

const DynamicShoeStory = dynamic(
  () => import("@/components/shoe-scroll-story").then((module) => module.ShoeScrollStory),
  { ssr: false, loading: () => <ShoeStoryPlaceholder /> },
);

function ShoeStoryPlaceholder() {
  return (
    <section className="shoe-story shoe-story-placeholder" aria-hidden="true">
      <div className="shoe-story-sticky">
        <div className="shoe-story-bg shoe-bg-pearl" />
        <div className="shoe-story-entry">
          <span className="shoe-parallax-word shoe-parallax-word--one">MOVE</span>
          <span className="shoe-parallax-word shoe-parallax-word--two">PLAY</span>
        </div>
        <span className="shoe-placeholder-orbit"><i /></span>
      </div>
    </section>
  );
}

export function ShoeStoryGate() {
  return <DynamicShoeStory />;
}
