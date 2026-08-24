"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent, PointerEvent } from "react";
import type { Product } from "@/lib/catalog";
import { ArrowLeftIcon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";

export function FeaturedProductRail({ products }: { products: Product[] }) {
  const featuredProducts = products.slice(0, 6);
  const featuredCount = featuredProducts.length;
  const initialIndex = Math.max(0, Math.floor((featuredCount - 1) / 2));
  const railRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const suppressClickRef = useRef(false);
  const dragRef = useRef({
    active: false,
    moved: false,
    pointerId: -1,
    startX: 0,
    startScrollLeft: 0,
  });
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [dragging, setDragging] = useState(false);

  const centerCard = useCallback((index: number, behavior: ScrollBehavior) => {
    const rail = railRef.current;
    const nextIndex = Math.max(0, Math.min(featuredCount - 1, index));
    const target = rail?.querySelector<HTMLElement>(
      `[data-featured-index="${nextIndex}"]`,
    );
    if (!rail || !target) return;

    const railRect = rail.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const left =
      rail.scrollLeft +
      (targetRect.left - railRect.left) -
      (rail.clientWidth - targetRect.width) / 2;
    rail.scrollTo({ left: Math.max(0, left), behavior });
  }, [featuredCount]);

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => centerCard(initialIndex, "auto"));
    return () => cancelAnimationFrame(frame);
  }, [centerCard, initialIndex]);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => centerCard(activeIndex, "auto");
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeIndex, centerCard]);

  if (!featuredProducts.length) return null;

  const closestCardIndex = () => {
    const rail = railRef.current;
    if (!rail) return activeIndex;

    const railRect = rail.getBoundingClientRect();
    const railCenter = railRect.left + railRect.width / 2;
    const items = Array.from(
      rail.querySelectorAll<HTMLElement>("[data-featured-index]"),
    );

    return items.reduce(
      (best, item, index) => {
        const itemRect = item.getBoundingClientRect();
        const distance = Math.abs(itemRect.left + itemRect.width / 2 - railCenter);
        return distance < best.distance ? { index, distance } : best;
      },
      { index: activeIndex, distance: Number.POSITIVE_INFINITY },
    ).index;
  };

  const updateActiveCard = () => {
    if (frameRef.current !== null) return;

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const rail = railRef.current;
      if (!rail) return;

      const closest = closestCardIndex();
      setActiveIndex((current) => (current === closest ? current : closest));
    });
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    if ((event.target as HTMLElement).closest("button, select, input, label")) return;

    const rail = railRef.current;
    if (!rail) return;

    dragRef.current = {
      active: true,
      moved: false,
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: rail.scrollLeft,
    };
    rail.setPointerCapture(event.pointerId);
    setDragging(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    const drag = dragRef.current;
    if (!rail || !drag.active || event.pointerId !== drag.pointerId) return;

    const distance = event.clientX - drag.startX;
    if (Math.abs(distance) > 5) drag.moved = true;
    rail.scrollLeft = drag.startScrollLeft - distance;
  };

  const finishDrag = (event: PointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    const drag = dragRef.current;
    if (!rail || !drag.active || event.pointerId !== drag.pointerId) return;

    if (rail.hasPointerCapture(event.pointerId)) {
      rail.releasePointerCapture(event.pointerId);
    }

    drag.active = false;
    setDragging(false);

    if (drag.moved) {
      suppressClickRef.current = true;
      const closest = closestCardIndex();
      setActiveIndex(closest);
      centerCard(closest, "smooth");
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }
  };

  const suppressDraggedClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClickRef.current = false;
  };

  const goToCard = (index: number) => {
    const nextIndex = Math.max(0, Math.min(featuredProducts.length - 1, index));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    centerCard(nextIndex, reduceMotion ? "auto" : "smooth");
    setActiveIndex(nextIndex);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToCard(activeIndex - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToCard(activeIndex + 1);
    }
  };

  const progress = ((activeIndex + 1) / featuredProducts.length) * 100;

  return (
    <section
      className="relative isolate -mt-px overflow-hidden bg-[#0b2740] pb-24 pt-16 text-[#fff2df] [--card-w:84vw] sm:[--card-w:72vw] md:pb-32 md:pt-24 md:[--card-w:43vw] lg:[--card-w:31vw] xl:[--card-w:380px]"
      aria-labelledby="featured-rail-title"
      dir="rtl"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_76%_12%,rgba(66,151,194,0.2),transparent_29%),radial-gradient(circle_at_16%_62%,rgba(255,145,135,0.08),transparent_24%),linear-gradient(180deg,#0b2740_0%,#081d36_58%,#0d2b46_100%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute -left-[4vw] top-12 -z-10 select-none whitespace-nowrap font-sans text-[clamp(92px,15vw,240px)] font-black leading-none tracking-[-0.09em] text-white/[0.025]"
        aria-hidden="true"
      >
        DANIA PICKS
      </span>

      <header className="mx-auto mb-10 flex w-[min(1180px,calc(100%_-_2rem))] flex-col gap-8 md:mb-14 md:flex-row md:items-end md:justify-between md:gap-10">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-[#f5c542]/30 bg-[#f5c542]/10 px-3 py-2 text-[9px] font-black text-[#f5c542]">
              محبوبِ پاهای کوچک
            </span>
            <span className="font-sans text-[8px] font-bold tracking-[0.22em] text-white/35" dir="ltr">
              DANIA / EDIT 01
            </span>
          </div>

          <h2
            id="featured-rail-title"
            className="mt-5 text-[clamp(40px,5.5vw,76px)] font-semibold leading-[1.03] tracking-[-0.065em] text-[#fff2df]"
          >
            انتخاب‌های آماده‌ی بازی
          </h2>
          <p className="mt-4 max-w-md text-[11px] leading-8 text-[#c2d4df]/70">
            مدل‌های سبک و راحت برای روزهایی که قرار نیست آرام بگذرند.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 md:justify-end">
          <Link
            href="/shop"
            className="group/link inline-flex h-11 items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 text-[10px] font-extrabold text-[#fff2df] backdrop-blur-sm transition hover:border-[#f5c542]/60 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]"
          >
            همه محصولات
            <span className="transition group-hover/link:-translate-x-1 [&>svg]:size-3.5">
              <ArrowLeftIcon />
            </span>
          </Link>

          <div className="flex gap-2" dir="ltr" aria-label="پیمایش محصولات">
            <button
              type="button"
              onClick={() => goToCard(activeIndex - 1)}
              disabled={activeIndex === 0}
              aria-label="محصول قبلی"
              className="grid size-11 place-items-center rounded-full border border-white/15 bg-white/[0.04] text-lg text-[#fff2df] transition hover:border-[#f5c542]/60 hover:bg-white/[0.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542] disabled:cursor-not-allowed disabled:opacity-25"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => goToCard(activeIndex + 1)}
              disabled={activeIndex === featuredProducts.length - 1}
              aria-label="محصول بعدی"
              className="grid size-11 place-items-center rounded-full border border-white/15 bg-white/[0.04] text-lg text-[#fff2df] transition hover:border-[#f5c542]/60 hover:bg-white/[0.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542] disabled:cursor-not-allowed disabled:opacity-25"
            >
              →
            </button>
          </div>
        </div>
      </header>

      <div
        ref={railRef}
        className={`flex gap-4 overflow-x-auto pb-10 pt-3 [overscroll-behavior-inline:contain] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:gap-6 ${
          dragging
            ? "cursor-grabbing select-none snap-none scroll-auto"
            : "cursor-grab snap-x snap-mandatory scroll-smooth"
        }`}
        style={{ paddingInline: "calc((100% - var(--card-w)) / 2)" }}
        onScroll={updateActiveCard}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onClickCapture={suppressDraggedClick}
        onDragStart={(event) => event.preventDefault()}
        aria-label="محصولات محبوب"
        tabIndex={0}
        dir="ltr"
      >
        {featuredProducts.map((product, index) => {
          const active = index === activeIndex;

          return (
            <div
              key={product.id}
              data-featured-index={index}
              aria-current={active ? "true" : undefined}
              className={`w-[var(--card-w)] shrink-0 snap-center transition duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${
                active
                  ? "translate-y-0 scale-100 opacity-100"
                  : "translate-y-3 scale-[0.965] opacity-60"
              }`}
              dir="rtl"
            >
              <ProductCard product={product} variant="featured" />
            </div>
          );
        })}
      </div>

      <footer className="mx-auto mt-1 grid w-[min(520px,calc(100%_-_2rem))] grid-cols-[auto_1fr_auto] items-center gap-4 font-sans text-[8px] font-bold tracking-[0.18em] text-white/35" dir="ltr">
        <span aria-live="polite">
          {String(activeIndex + 1).padStart(2, "0")} / {String(featuredProducts.length).padStart(2, "0")}
        </span>
        <span className="h-px overflow-hidden bg-white/15" aria-hidden="true">
          <i
            className="block h-full origin-left bg-[#f5c542] transition-transform duration-500 ease-out"
            style={{ transform: `scaleX(${progress / 100})` }}
          />
        </span>
        <span className="hidden sm:block">DRAG / SWIPE</span>
      </footer>
    </section>
  );
}