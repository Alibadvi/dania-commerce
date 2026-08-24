"use client";

import { useRef, useState } from "react";
import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import type { Product } from "@/lib/catalog";
import { products as fallbackProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";

type RecommendedProductsCarouselProps = {
  products: Product[];
  currentSlug: string;
  currentCategory: Product["category"];
};

export function RecommendedProductsCarousel({
  products,
  currentSlug,
  currentCategory,
}: RecommendedProductsCarouselProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ startX: 0, startScroll: 0, moved: false });
  const [dragging, setDragging] = useState(false);

  const source = products.some((item) => item.slug !== currentSlug)
    ? products
    : fallbackProducts;
  const recommendations = [
    ...source.filter(
      (item) => item.slug !== currentSlug && item.category === currentCategory,
    ),
    ...source.filter(
      (item) => item.slug !== currentSlug && item.category !== currentCategory,
    ),
  ].slice(0, 8);

  if (!recommendations.length) return null;

  const scrollRail = (direction: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({
      left: direction * Math.max(300, rail.clientWidth * 0.78),
      behavior: "smooth",
    });
  };

  const pointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const rail = event.currentTarget;
    drag.current = {
      startX: event.clientX,
      startScroll: rail.scrollLeft,
      moved: false,
    };
    rail.setPointerCapture(event.pointerId);
    setDragging(true);
  };

  const pointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging || event.pointerType !== "mouse") return;
    const distance = event.clientX - drag.current.startX;
    if (Math.abs(distance) > 5) drag.current.moved = true;
    event.currentTarget.scrollLeft = drag.current.startScroll - distance;
  };

  const finishDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const rail = event.currentTarget;
    if (rail.hasPointerCapture(event.pointerId)) {
      rail.releasePointerCapture(event.pointerId);
    }
    setDragging(false);

    const firstSlide = rail.querySelector<HTMLElement>("[data-recommendation]");
    if (!firstSlide) return;
    const gap = 16;
    const step = firstSlide.offsetWidth + gap;
    rail.scrollTo({
      left: Math.round(rail.scrollLeft / step) * step,
      behavior: "smooth",
    });
  };

  const stopDraggedClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!drag.current.moved) return;
    event.preventDefault();
    event.stopPropagation();
    drag.current.moved = false;
  };

  return (
    <section
      id="recommended-products"
      className="relative isolate overflow-hidden bg-[#071b31] py-16 text-[#fff4e3] sm:py-20 lg:py-24"
      aria-labelledby="recommended-products-title"
      dir="rtl"
    >
      <div
        className="pointer-events-none absolute -left-24 top-8 -z-10 size-80 rounded-full bg-[#ef8176]/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-0 -z-10 size-72 rounded-full bg-[#315dff]/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 md:px-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 text-[9px] font-black text-[#f5c542]">
              <span className="h-px w-9 bg-current" aria-hidden="true" />
              انتخاب‌های بعدی
            </div>
            <h2
              id="recommended-products-title"
              className="mt-5 text-[clamp(32px,5vw,58px)] font-black leading-[1.08] tracking-[-.055em]"
            >
              شاید این‌ها هم
              <br />
              <span className="text-[#ff9187]">به پایش بیایند.</span>
            </h2>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scrollRail(-1)}
              className="grid size-12 place-items-center rounded-full border border-white/15 !bg-white/[.05] text-xl !text-[#fff4e3] transition hover:!bg-white/[.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]"
              aria-label="محصول قبلی"
            >
              ›
            </button>
            <button
              type="button"
              onClick={() => scrollRail(1)}
              className="grid size-12 place-items-center rounded-full !bg-[#f5c542] text-xl !text-[#102b49] transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="محصول بعدی"
            >
              ‹
            </button>
          </div>
        </div>

        <div
          ref={railRef}
          dir="ltr"
          onPointerDown={pointerDown}
          onPointerMove={pointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
          onClickCapture={stopDraggedClick}
          className={`-mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-8 pt-2 [scrollbar-width:none] sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 [&::-webkit-scrollbar]:hidden ${
            dragging ? "cursor-grabbing select-none snap-none" : "cursor-grab"
          }`}
          aria-label="محصولات پیشنهادی"
        >
          {recommendations.map((item) => (
            <div
              key={item.id}
              data-recommendation
              dir="rtl"
              className="w-[min(84vw,355px)] shrink-0 snap-start sm:w-[355px] lg:w-[380px]"
            >
              <ProductCard product={item} variant="featured" />
            </div>
          ))}
        </div>

        <p className="mt-1 text-[8px] font-bold text-white/35 sm:hidden">
          برای دیدن مدل‌های بیشتر، کارت‌ها را بکش.
        </p>
      </div>
    </section>
  );
}