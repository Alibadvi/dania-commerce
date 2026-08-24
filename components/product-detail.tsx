"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { formatPrice, products as fallbackProducts } from "@/lib/catalog";
import {
  HeartIcon,
  RefreshIcon,
  RulerIcon,
  ShieldIcon,
  TruckIcon,
} from "@/components/icons";
import { useShop } from "@/components/shop-shell";
import { RecommendedProductsCarousel } from "@/components/recommended-products-carousel";
import { ProductVisual } from "@/components/product-visual";

const PERSIAN_FONT_STACK =
  '"Vazirmatn Variable", Vazirmatn, Tahoma, Arial, sans-serif';

export function ProductDetail({ product }: { product: Product }) {
  const [size, setSize] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [notice, setNotice] = useState(false);
  const [adding, setAdding] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");
  const { addToCart, catalog } = useShop();

  const liveProduct =
    catalog.find((item) => item.slug === product.slug) ?? product;
  const recommendationSource =
    catalog.filter((item) => item.slug !== product.slug).length > 0
      ? catalog
      : fallbackProducts;
  const selectedVariant = size
    ? liveProduct.variants.find((variant) => variant.size === size)
    : undefined;
  const hasStock = liveProduct.variants.some(
    (variant) => variant.stockLevel === "IN_STOCK",
  );
  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : null;
  const cartLabel = adding
    ? "در حال افزودن…"
    : size
      ? `افزودن سایز ${size.toLocaleString("fa-IR")} به سبد`
      : "انتخاب سایز و افزودن به سبد";

  useEffect(() => {
    if (!zoomOpen) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZoomOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [zoomOpen]);

  const openZoom = () => {
    setZoomLevel(1);
    setZoomOrigin("50% 50%");
    setZoomOpen(true);
  };

  const submit = async () => {
    if (!selectedVariant || selectedVariant.stockLevel !== "IN_STOCK") {
      setNotice(true);
      return;
    }

    setAdding(true);
    setActionError(null);
    try {
      await addToCart(selectedVariant.id);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "افزودن محصول به سبد انجام نشد.",
      );
    } finally {
      setAdding(false);
    }
  };

  return (
    <main
      className="min-h-screen bg-[#f5efe6] pb-24 text-[#102b49] lg:pb-0"
      dir="rtl"
      style={{ fontFamily: PERSIAN_FONT_STACK }}
    >
      <section className="relative isolate overflow-hidden bg-[#071b31] pb-16 text-[#fff4e3] sm:pb-20 lg:pb-28">
        <div
          className="pointer-events-none absolute -left-24 top-20 -z-10 size-96 rounded-full bg-[#315dff]/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-28 bottom-0 -z-10 size-96 rounded-full bg-[#ef8176]/10 blur-3xl"
          aria-hidden="true"
        />

        <nav
          aria-label="مسیر صفحه"
          className="mx-auto flex max-w-[1320px] items-center gap-2 overflow-hidden px-4 py-5 text-[9px] text-white/35 sm:px-6 md:px-8 md:py-6"
        >
          <Link className="shrink-0 transition hover:text-white" href="/">
            خانه
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            className="shrink-0 transition hover:text-white"
            href="/shop"
          >
            فروشگاه
          </Link>
          <span aria-hidden="true">/</span>
          <b className="truncate font-black text-[#f5c542]">{product.name}</b>
        </nav>

        <div className="mx-auto grid max-w-[1320px] gap-6 px-4 sm:px-6 md:px-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(390px,.88fr)] lg:items-start lg:gap-8 xl:gap-12">
          <div className="min-w-0">
            <div className="group relative isolate overflow-hidden rounded-[30px] border border-white/10 bg-[#dbeef4] shadow-[0_38px_110px_rgba(0,7,24,.38)] sm:rounded-[40px]">
              <span
                className="pointer-events-none absolute -right-16 top-[18%] z-0 size-56 rounded-full bg-[#ff9187]/65 sm:size-72"
                aria-hidden="true"
              />
              <span
                className="pointer-events-none absolute -bottom-24 -left-16 z-0 size-64 rounded-full bg-[#f5c542]/75 sm:size-80"
                aria-hidden="true"
              />
              <span
                className="pointer-events-none absolute -bottom-[.12em] left-1/2 z-0 -translate-x-1/2 select-none font-sans text-[clamp(100px,18vw,250px)] font-black leading-none tracking-[-.1em] text-[#102b49]/[.055]"
                dir="ltr"
                aria-hidden="true"
              >
                MOVE
              </span>

              <div className="absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-4 p-4 sm:p-6">
                <span
                  className="rounded-full border border-white/70 bg-white/80 px-3.5 py-2 font-sans text-[8px] font-black tracking-[.16em] !text-[#102b49] shadow-sm backdrop-blur-md"
                  dir="ltr"
                >
                  DANIA / PLAY 01
                </span>
                {discount ? (
                  <span className="rounded-full bg-[#ef8176] px-3.5 py-2 text-[9px] font-black !text-white shadow-[0_10px_25px_rgba(239,129,118,.3)]">
                    ٪{discount.toLocaleString("fa-IR")} تخفیف
                  </span>
                ) : product.badge ? (
                  <span className="rounded-full bg-[#102b49] px-3.5 py-2 text-[9px] font-black !text-[#fff4e3]">
                    {product.badge}
                  </span>
                ) : null}
              </div>

              <ProductVisual
                product={liveProduct}
                alt={product.name}
                className="relative z-10 h-[430px] w-full transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.025] sm:h-[590px] lg:h-[700px]"
              />

              <button
                type="button"
                onClick={openZoom}
                className="absolute inset-0 z-20 cursor-zoom-in !border-0 !bg-transparent !p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#ef8176]"
                aria-label={`بزرگ‌نمایی تصویر ${product.name}`}
              />

              <button
                type="button"
                onClick={openZoom}
                className="absolute bottom-4 left-4 z-30 inline-flex min-h-11 items-center gap-2 rounded-full border border-[#102b49]/10 bg-white/85 px-4 text-[9px] font-black !text-[#102b49] shadow-md backdrop-blur-md transition hover:scale-105 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef8176] sm:bottom-6 sm:left-6"
              >
                <span className="text-base" aria-hidden="true">⌕</span>
                زوم روی محصول
              </button>

              <span
                className="pointer-events-none absolute bottom-7 right-5 z-30 hidden origin-bottom-right -rotate-90 font-sans text-[8px] font-black tracking-[.2em] text-[#102b49]/45 sm:block"
                dir="ltr"
              >
                LIGHT / FLEXIBLE / READY
              </span>
            </div>

            <div className="mt-3 grid grid-cols-[1.15fr_.85fr_.85fr] gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={openZoom}
                className="group/thumb relative h-24 overflow-hidden rounded-[19px] border-2 border-[#f5c542] !bg-[#fffaf2] !p-0 sm:h-32 sm:rounded-[24px]"
                aria-label="باز کردن تصویر اصلی"
              >
                <ProductVisual
                  product={liveProduct}
                  alt={product.name}
                  className="block h-full w-full transition-transform duration-500 group-hover/thumb:scale-105"
                />
                <span className="absolute bottom-2 right-2 rounded-full bg-[#102b49] px-2 py-1 text-[7px] font-black !text-white">
                  نمای اصلی
                </span>
              </button>
              <article className="flex h-24 flex-col justify-between rounded-[19px] bg-[#ef8176] p-3 text-[#102b49] sm:h-32 sm:rounded-[24px] sm:p-4">
                <span className="font-sans text-[8px] font-black tracking-[.14em]" dir="ltr">SOFT / 02</span>
                <strong className="text-[9px] leading-5 sm:text-[11px]">نرم برای بازی‌های طولانی</strong>
              </article>
              <article className="flex h-24 flex-col justify-between rounded-[19px] bg-[#f5c542] p-3 text-[#102b49] sm:h-32 sm:rounded-[24px] sm:p-4">
                <span className="font-sans text-[8px] font-black tracking-[.14em]" dir="ltr">GRIP / 03</span>
                <strong className="text-[9px] leading-5 sm:text-[11px]">مطمئن در حرکت روزمره</strong>
              </article>
            </div>
          </div>

          <aside className="min-w-0 lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[#fff7eb] p-5 text-[#102b49] shadow-[0_35px_100px_rgba(0,7,24,.3)] sm:rounded-[38px] sm:p-7 lg:p-8">
              <div className="-mx-5 -mt-5 mb-6 flex h-12 items-center justify-between bg-[#ef8176] px-5 sm:-mx-7 sm:-mt-7 sm:px-7 lg:-mx-8 lg:-mt-8 lg:px-8">
                <span
                  className="font-sans text-[8px] font-black tracking-[.18em]"
                  dir="ltr"
                >
                  MADE FOR LITTLE MOVERS
                </span>
                <span className="size-2 rounded-full bg-[#f5c542] shadow-[0_0_0_4px_rgba(245,197,66,.26)]" />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-[9px] font-black text-[#102b49]/45">
                  {product.category} · {product.color}
                </span>
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-[8px] font-black ${
                    hasStock
                      ? "bg-emerald-500/10 text-emerald-700"
                      : "bg-[#ef8176]/10 text-[#a83d44]"
                  }`}
                >
                  <i
                    className={`size-1.5 rounded-full ${hasStock ? "bg-emerald-500" : "bg-[#ef8176]"}`}
                  />
                  {hasStock ? "موجود و آماده ارسال" : "در حال حاضر ناموجود"}
                </span>
              </div>

              <p className="mt-6 text-[10px] font-bold text-[#102b49]/40">
                {product.subtitle}
              </p>
              <h1 className="mt-2 text-[clamp(40px,5vw,64px)] font-black leading-[1.03] tracking-[-.065em]">
                {product.name}
              </h1>
              <p className="mt-5 text-[11px] leading-8 text-[#60717f] sm:text-[12px]">
                {product.description}
              </p>

              <div className="mt-7 flex flex-wrap items-end justify-between gap-4 border-y border-[#102b49]/10 py-5">
                <div>
                  <span className="text-[8px] font-bold text-[#102b49]/35">قیمت نهایی</span>
                  <div className="mt-1.5 flex items-baseline gap-2">
                    <strong className="text-[27px] font-black tracking-[-.04em] sm:text-[31px]">
                      {formatPrice(product.price)}
                    </strong>
                    <span className="text-[9px] font-black text-[#997210]">تومان</span>
                  </div>
                </div>
                {product.oldPrice && (
                  <div className="text-left">
                    <span className="block text-[8px] text-[#102b49]/35">قیمت قبل</span>
                    <del className="mt-1.5 block text-[11px] text-[#102b49]/40">
                      {formatPrice(product.oldPrice)} تومان
                    </del>
                  </div>
                )}
              </div>

              <div className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <strong className="text-[13px] font-black">انتخاب سایز</strong>
                    <p className="mt-1.5 text-[8px] text-[#102b49]/40">
                      سایزهای خط‌خورده در حال حاضر موجود نیستند.
                    </p>
                  </div>
                  <Link
                    href="/contact"
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#dbeef4] px-3 py-2 text-[9px] font-black !text-[#315dff] transition hover:bg-[#cde7f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315dff] [&_svg]:w-3.5"
                  >
                    <RulerIcon /> راهنمای سایز
                  </Link>
                </div>

                <div className="mt-5 grid grid-cols-5 gap-2 sm:flex sm:flex-wrap">
                  {liveProduct.sizes.map((item) => {
                    const variant = liveProduct.variants.find(
                      (candidate) => candidate.size === item,
                    );
                    const available = variant?.stockLevel === "IN_STOCK";
                    const selected = size === item;

                    return (
                      <button
                        type="button"
                        key={item}
                        disabled={!available}
                        aria-pressed={selected}
                        aria-label={`سایز ${item.toLocaleString("fa-IR")}${available ? "" : "، ناموجود"}`}
                        onClick={() => {
                          setSize(item);
                          setNotice(false);
                          setActionError(null);
                        }}
                        className={`relative grid h-12 min-w-0 place-items-center rounded-[14px] border text-[11px] font-black transition sm:size-12 ${
                          selected
                            ? "border-[#102b49] !bg-[#102b49] !text-white shadow-[0_10px_24px_rgba(16,43,73,.2)]"
                            : available
                              ? "border-[#102b49]/15 !bg-white !text-[#102b49] hover:-translate-y-0.5 hover:border-[#102b49]/45"
                              : "cursor-not-allowed border-[#102b49]/[.07] !bg-[#eee7dc] !text-[#102b49]/25 after:absolute after:h-px after:w-7 after:-rotate-45 after:bg-[#102b49]/20"
                        }`}
                      >
                        {item.toLocaleString("fa-IR")}
                      </button>
                    );
                  })}
                </div>

                {size && !notice && (
                  <p className="mt-3 text-[9px] font-black text-emerald-700">
                    سایز {size.toLocaleString("fa-IR")} انتخاب شد.
                  </p>
                )}
                {notice && (
                  <p className="mt-3 rounded-xl bg-[#ef8176]/10 px-3 py-2.5 text-[9px] font-bold text-[#a83d44]" role="alert">
                    برای ادامه، یک سایز موجود انتخاب کن.
                  </p>
                )}
                {actionError && (
                  <p className="mt-3 rounded-xl bg-[#ef8176]/10 px-3 py-2.5 text-[9px] font-bold text-[#a83d44]" role="alert">
                    {actionError}
                  </p>
                )}
              </div>

              <div className="mt-6 hidden gap-2 lg:flex">
                <button
                  type="button"
                  disabled={adding || !hasStock}
                  onClick={() => void submit()}
                  className="flex min-h-14 flex-1 items-center justify-center rounded-2xl !bg-[#102b49] px-5 text-[11px] font-black !text-[#fff4e3] shadow-[0_16px_32px_rgba(16,43,73,.2)] transition hover:-translate-y-0.5 hover:!bg-[#1d466e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {cartLabel}
                </button>
                <button
                  type="button"
                  onClick={() => setLiked((current) => !current)}
                  aria-label={liked ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
                  aria-pressed={liked}
                  className={`grid size-14 shrink-0 place-items-center rounded-2xl border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef8176] [&_svg]:w-5 ${
                    liked
                      ? "border-[#ef8176] !bg-[#ef8176] !text-white [&_svg]:fill-current"
                      : "border-[#102b49]/10 !bg-white !text-[#102b49] hover:border-[#ef8176] hover:!text-[#ef8176]"
                  }`}
                >
                  <HeartIcon />
                </button>
              </div>

              <div className="mt-6 grid grid-cols-3 divide-x divide-x-reverse divide-[#102b49]/10 rounded-[20px] border border-[#102b49]/10 bg-white p-4">
                <div className="flex flex-col items-center gap-2 px-1 text-center [&_svg]:w-5 [&_svg]:text-[#ef8176]">
                  <TruckIcon />
                  <span><strong className="block text-[8px] sm:text-[9px]">ارسال سریع</strong><small className="mt-1 block text-[7px] text-[#102b49]/40 sm:text-[8px]">۱ تا ۳ روز کاری</small></span>
                </div>
                <div className="flex flex-col items-center gap-2 px-1 text-center [&_svg]:w-5 [&_svg]:text-[#ef8176]">
                  <RefreshIcon />
                  <span><strong className="block text-[8px] sm:text-[9px]">تعویض سایز</strong><small className="mt-1 block text-[7px] text-[#102b49]/40 sm:text-[8px]">تا ۷ روز</small></span>
                </div>
                <div className="flex flex-col items-center gap-2 px-1 text-center [&_svg]:w-5 [&_svg]:text-[#ef8176]">
                  <ShieldIcon />
                  <span><strong className="block text-[8px] sm:text-[9px]">کنترل کیفیت</strong><small className="mt-1 block text-[7px] text-[#102b49]/40 sm:text-[8px]">پیش از ارسال</small></span>
                </div>
              </div>

              <a
                href="#recommended-products"
                className="mt-4 flex min-h-11 items-center justify-between rounded-2xl border border-[#102b49]/10 bg-[#f5c542]/20 px-4 text-[9px] font-black !text-[#102b49] transition hover:border-[#f5c542] hover:bg-[#f5c542]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]"
              >
                دیدن مدل‌های پیشنهادی
                <span className="text-base" aria-hidden="true">↓</span>
              </a>
            </div>
          </aside>
        </div>
      </section>

      <div className="overflow-hidden border-y border-[#102b49]/10 bg-[#ef8176] py-3.5 text-[#102b49]" aria-hidden="true">
        <div className="flex min-w-max items-center gap-8 whitespace-nowrap font-sans text-[9px] font-black tracking-[.18em] sm:gap-12 sm:text-[10px]" dir="ltr">
          <span>MOVE FREELY</span><i className="size-1.5 rounded-full bg-[#f5c542]" />
          <span>PLAY LONGER</span><i className="size-1.5 rounded-full bg-[#f5c542]" />
          <span>GROW NATURALLY</span><i className="size-1.5 rounded-full bg-[#f5c542]" />
          <span>DANIA KIDS</span><i className="size-1.5 rounded-full bg-[#f5c542]" />
          <span>MOVE FREELY</span><i className="size-1.5 rounded-full bg-[#f5c542]" />
          <span>PLAY LONGER</span><i className="size-1.5 rounded-full bg-[#f5c542]" />
          <span>GROW NATURALLY</span>
        </div>
      </div>

      <section className="px-4 py-16 sm:px-6 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1320px]">
          <div className="grid gap-6 lg:grid-cols-[.85fr_1.15fr] lg:items-end">
            <div>
              <span className="text-[9px] font-black text-[#ef8176]">چرا این مدل؟</span>
              <h2 className="mt-4 text-[clamp(34px,5vw,58px)] font-black leading-[1.08] tracking-[-.055em]">
                برای پاهایی که
                <br />
                <span className="text-[#315dff]">یک‌جا نمی‌مانند.</span>
              </h2>
            </div>
            <p className="max-w-xl text-[11px] leading-8 text-[#60717f] lg:justify-self-end">
              یک کفش خوب نباید حرکت کودک را کنترل کند. باید سبک، نرم و همراه باشد؛ آن‌قدر که کودک حضورش را فراموش کند و بازی را ادامه بدهد.
            </p>
          </div>

          <div className="mt-10 grid gap-3 md:grid-cols-3">
            {[
              ["01", "ROOM TO GROW", "پنجه‌ی جادار", "فضای کافی برای حرکت طبیعی انگشت‌ها، بدون فشار اضافه در طول روز.", "bg-[#dbeef4] text-[#102b49]", "text-[#315dff]"],
              ["02", "BEND WITH IT", "زیره‌ی منعطف", "همراه با خم‌شدن پا؛ برای قدم‌هایی طبیعی‌تر از راه‌رفتن تا دویدن.", "bg-[#f5c542] text-[#102b49]", "text-[#102b49]/60"],
              ["03", "LIGHT ALL DAY", "سبک و بی‌دردسر", "راحت برای پوشیدن و آن‌قدر سبک که انرژی کودک صرف خود بازی شود.", "bg-[#102b49] text-[#fff4e3]", "text-[#ff9187]"],
            ].map(([number, label, title, copy, theme, accent]) => (
              <article key={number} className={`relative min-h-[300px] overflow-hidden rounded-[30px] p-7 sm:min-h-[340px] sm:rounded-[36px] sm:p-9 ${theme}`}>
                <span className="absolute -bottom-10 -left-4 font-sans text-[150px] font-black leading-none opacity-[.055]" aria-hidden="true">{number}</span>
                <div className="relative flex h-full flex-col justify-between">
                  <span className={`font-sans text-[9px] font-black tracking-[.15em] ${accent}`} dir="ltr">{label}</span>
                  <div><h3 className="text-2xl font-black">{title}</h3><p className="mt-3 max-w-xs text-[10px] leading-7 opacity-[.65]">{copy}</p></div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-4 overflow-hidden rounded-[26px] border border-[#102b49]/10 bg-[#fffaf2] px-5 sm:px-8">
            <details open className="group border-b border-[#102b49]/10 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between text-[12px] font-black after:text-lg after:font-light after:content-['+'] group-open:after:content-['−']">ویژگی‌های محصول</summary>
              <ul className="mt-4 grid gap-2.5 pr-4 text-[10px] leading-6 text-[#60717f] marker:text-[#ef8176] sm:grid-cols-2">
                <li>رویه قابل تنفس برای استفاده روزمره</li><li>کفی نرم با جذب فشار قدم‌ها</li><li>زیره سبک، منعطف و مقاوم در برابر لغزش</li><li>پوشیدن آسان برای استقلال بیشتر کودک</li>
              </ul>
            </details>
            <details className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between text-[12px] font-black after:text-lg after:font-light after:content-['+'] group-open:after:content-['−']">نگهداری و شست‌وشو</summary>
              <p className="mt-4 text-[10px] leading-7 text-[#60717f]">با دستمال مرطوب تمیز شود. از ماشین لباس‌شویی، مواد سفیدکننده و گرمای مستقیم استفاده نکنید.</p>
            </details>
          </div>
        </div>
      </section>

      <RecommendedProductsCarousel
        products={recommendationSource}
        currentSlug={product.slug}
        currentCategory={product.category}
      />

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#102b49]/10 bg-[#fffaf2]/95 px-3 pb-[max(.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-14px_40px_rgba(16,43,73,.12)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-xl gap-2">
          <button type="button" disabled={adding || !hasStock} onClick={() => void submit()} className="flex min-h-[52px] flex-1 items-center justify-center rounded-2xl !bg-[#102b49] px-4 text-[10px] font-black !text-[#fff4e3] shadow-[0_12px_28px_rgba(16,43,73,.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542] disabled:cursor-not-allowed disabled:opacity-40">{cartLabel}</button>
          <button type="button" onClick={() => setLiked((current) => !current)} aria-label={liked ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"} aria-pressed={liked} className={`grid size-[52px] shrink-0 place-items-center rounded-2xl border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef8176] [&_svg]:w-5 ${liked ? "border-[#ef8176] !bg-[#ef8176] !text-white [&_svg]:fill-current" : "border-[#102b49]/10 !bg-white !text-[#102b49]"}`}><HeartIcon /></button>
        </div>
      </div>

      {zoomOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#061527]/95 p-3 backdrop-blur-xl sm:p-6" role="dialog" aria-modal="true" aria-label={`نمای بزرگ ${product.name}`}>
          <button type="button" className="absolute inset-0 !cursor-default !border-0 !bg-transparent" onClick={() => setZoomOpen(false)} aria-label="بستن بزرگ‌نمایی" />
          <div className="relative flex h-[min(88vh,900px)] w-full max-w-[1100px] flex-col overflow-hidden rounded-[26px] border border-white/10 bg-[#dbeef4] shadow-[0_40px_120px_rgba(0,0,0,.45)] sm:rounded-[38px]">
            <div className="relative z-20 flex h-16 shrink-0 items-center justify-between border-b border-[#102b49]/10 bg-[#fffaf2]/95 px-4 backdrop-blur-md sm:px-6">
              <div><strong className="block text-[11px] font-black">{product.name}</strong><span className="mt-1 block text-[8px] text-[#102b49]/40">حرکت موس، نقطه زوم را تغییر می‌دهد.</span></div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setZoomLevel((level) => Math.max(1, level - .5))} disabled={zoomLevel === 1} className="grid size-10 place-items-center rounded-full border border-[#102b49]/10 !bg-white text-lg !text-[#102b49] disabled:opacity-30" aria-label="کوچک‌نمایی">−</button>
                <span className="w-10 text-center font-sans text-[9px] font-bold" dir="ltr">{Math.round(zoomLevel * 100)}%</span>
                <button type="button" onClick={() => setZoomLevel((level) => Math.min(3, level + .5))} disabled={zoomLevel === 3} className="grid size-10 place-items-center rounded-full border border-[#102b49]/10 !bg-white text-lg !text-[#102b49] disabled:opacity-30" aria-label="بزرگ‌نمایی">+</button>
                <button type="button" onClick={() => setZoomOpen(false)} className="mr-1 grid size-10 place-items-center rounded-full !bg-[#102b49] text-lg !text-white" aria-label="بستن">×</button>
              </div>
            </div>
            <div className="relative min-h-0 flex-1 cursor-crosshair overflow-hidden" onPointerMove={(event) => { if (zoomLevel === 1) return; const bounds = event.currentTarget.getBoundingClientRect(); setZoomOrigin(`${((event.clientX - bounds.left) / bounds.width) * 100}% ${((event.clientY - bounds.top) / bounds.height) * 100}%`); }} onDoubleClick={() => setZoomLevel((level) => level === 1 ? 2 : 1)}>
              <ProductVisual
                product={liveProduct}
                alt={product.name}
                className="h-full w-full transition-transform duration-300 ease-out"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: zoomOrigin,
                }}
              />
              <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-[#102b49]/85 px-4 py-2 text-[8px] font-bold !text-white backdrop-blur-md sm:hidden">از دکمه‌های بالا برای زوم استفاده کن</span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}