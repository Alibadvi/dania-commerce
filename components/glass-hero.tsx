"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { ArrowLeftIcon } from "@/components/icons";

const SLICE_DEPTHS = [0.28, 0.5, 0.75, 1, 1.22];

export function GlassHero() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = "connection" in navigator
      && Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
    if (reduceMotion || saveData) return;

    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;
    let scrollProgress = 0;
    let visible = true;

    const paint = () => {
      frame = 0;
      hero.querySelectorAll<HTMLElement>(".glass-slices i").forEach((slice, index) => {
        const depth = SLICE_DEPTHS[index] ?? 1;
        slice.style.setProperty("--slice-x", `${pointerX * depth * 18 + scrollProgress * depth * 8}px`);
        slice.style.setProperty("--slice-y", `${pointerY * depth * 8 - scrollProgress * depth * 13}px`);
      });
    };
    const schedule = () => {
      if (visible && !frame) frame = window.requestAnimationFrame(paint);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      const rect = hero.getBoundingClientRect();
      pointerX = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2));
      pointerY = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - 0.5) * 2));
      schedule();
    };
    const onPointerLeave = () => {
      pointerX = 0;
      pointerY = 0;
      schedule();
    };
    const onScroll = () => {
      const rect = hero.getBoundingClientRect();
      scrollProgress = Math.max(-1, Math.min(1, (window.innerHeight * 0.5 - rect.top) / window.innerHeight));
      schedule();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) onScroll();
    }, { rootMargin: "120px" });

    observer.observe(hero);
    hero.addEventListener("pointermove", onPointerMove, { passive: true });
    hero.addEventListener("pointerleave", onPointerLeave, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      observer.disconnect();
      hero.removeEventListener("pointermove", onPointerMove);
      hero.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section ref={heroRef} className="glass-hero" aria-labelledby="home-hero-title">
      <div className="glass-hero-image" role="img" aria-label="کتانی کودک مرجانی روی صحنه‌ای تیره با نور آبی" />
      <div className="glass-slices" aria-hidden="true">
        {SLICE_DEPTHS.map((depth, index) => <i key={depth} style={{ "--slice-index": index, "--slice-depth": depth } as CSSProperties} />)}
      </div>
      <div className="glass-hero-copy">
        <span className="hero-kicker"><i /> کالکشن تازه‌ی دانیا</span>
        <h1 id="home-hero-title">کوچک‌اند؛<br/><em>معمولی نه.</em></h1>
        <p>سبک برای دویدن، محکم برای بازی و راحت برای تمام روز؛ کفشی که با ریتم بچه‌ها جلو می‌رود.</p>
        <div className="glass-hero-actions">
          <Link href="/shop?category=girl" className="button neon">کفش دخترانه <ArrowLeftIcon /></Link>
          <Link href="/shop?category=boy" className="button glass">کفش پسرانه</Link>
        </div>
      </div>
      <div className="hero-index" aria-hidden="true"><span>۰۱</span><i /></div>
      <span className="hero-scroll-note" aria-hidden="true">حرکت کن، کشف کن</span>
    </section>
  );
}
