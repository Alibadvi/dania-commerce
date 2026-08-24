"use client";

import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

const PLAYGROUND_SHOES = [
  { id: "concept-01", image: "/images/dania-playground/concept-01.webp", name: "Coral Comet", tone: "CORAL / PEARL / CYAN", details: ["AIR MESH", "SOFT BOUNCE"] },
  { id: "concept-02", image: "/images/dania-playground/concept-02.webp", name: "Sunny Sprint", tone: "NAVY / SUN / CORAL", details: ["EASY STRAPS", "TRAIL GRIP"] },
  { id: "concept-03", image: "/images/dania-playground/concept-03.webp", name: "Lilac Loop", tone: "LILAC / AQUA / ORANGE", details: ["SOCK FIT", "FLEX SOLE"] },
] as const;

export function DaniaPlayground() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const context = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.from(".playground-head > *, .playground-shoe", {
        y: 36,
        opacity: 0,
        duration: 0.85,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 78%", once: true },
      });

      gsap.fromTo(".playground-progress i", { scaleX: 0 }, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 0.5 },
      });

      const media = gsap.matchMedia();
      media.add("(min-width: 701px)", () => {
        gsap.fromTo(".playground-marquee--move", { xPercent: -9 }, {
          xPercent: 9,
          ease: "none",
          scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 0.8 },
        });
        gsap.fromTo(".playground-marquee--play", { xPercent: 9 }, {
          xPercent: -9,
          ease: "none",
          scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 0.8 },
        });
        gsap.to(".playground-shoe--side-left", {
          yPercent: -5,
          ease: "none",
          scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 0.9 },
        });
        gsap.to(".playground-shoe--center", {
          yPercent: 4,
          ease: "none",
          scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 0.9 },
        });
        gsap.to(".playground-shoe--side-right", {
          yPercent: -3,
          ease: "none",
          scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 0.9 },
        });
      });
    }, section);

    return () => context.revert();
  }, []);

  return (
    <section ref={sectionRef} className="dania-playground" aria-labelledby="playground-title">
      <div className="playground-marquees" aria-hidden="true">
        <span className="playground-marquee playground-marquee--move">MOVE&nbsp;•&nbsp;MOVE&nbsp;•&nbsp;MOVE&nbsp;•&nbsp;</span>
        <span className="playground-marquee playground-marquee--play">PLAY&nbsp;•&nbsp;PLAY&nbsp;•&nbsp;PLAY&nbsp;•&nbsp;</span>
      </div>

      <div className="playground-head">
        <span>DANIA PLAYGROUND / 2026</span>
        <h2 id="playground-title">Made for every<br /><em>little move.</em></h2>
        <p>سه ایده برای بازی‌های بزرگ؛ سبک، نرم و آماده‌ی کشف دنیا.</p>
      </div>

      <div className="playground-shoes" aria-label="طرح‌های مفهومی کفش دانیا">
        {PLAYGROUND_SHOES.map((shoe, index) => (
          <article key={shoe.id} className={`playground-shoe playground-shoe--${index === 1 ? "center" : index === 0 ? "side-left" : "side-right"}`}>
            <div className="playground-concept-index">
              <span>CONCEPT</span>
              <b>{String(index + 1).padStart(2, "0")} / 03</b>
            </div>
            <div className="playground-shoe-media">
              <Image
                src={shoe.image}
                alt={`طرح مفهومی کفش کودک ${shoe.name}`}
                fill
                sizes="(max-width: 700px) 82vw, (max-width: 1100px) 46vw, 42vw"
                priority={index === 1}
              />
            </div>
            <div className="playground-shoe-meta">
              <div><strong>{shoe.name}</strong><span>{shoe.tone}</span></div>
              <ul>{shoe.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
            </div>
          </article>
        ))}
      </div>

      <div className="playground-progress" aria-hidden="true"><i /></div>
      <span className="playground-scroll-note" aria-hidden="true">01&nbsp;&nbsp;—&nbsp;&nbsp;03</span>
    </section>
  );
}
