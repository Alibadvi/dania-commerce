"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/catalog";
import { formatPrice } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";

type CategoryKey = "all" | "girl" | "boy";
type SortMode = "featured" | "low" | "high";

const CATEGORIES = [
  { value: "all", label: "همه کفش‌ها" },
  { value: "girl", label: "دخترانه" },
  { value: "boy", label: "پسرانه" },
] as const;

const CATEGORY_MAP: Record<Exclude<CategoryKey, "all">, Product["category"]> = {
  girl: "دخترانه",
  boy: "پسرانه",
};

const THEMES = {
  all: {
    hero: "#0c2943",
    surface: "#f7f1e8",
    accent: "#f3c744",
    activeText: "#102b49",
    activeTextClass: "!text-[#102b49]",
    glowOne: "rgba(243,199,68,0.18)",
    glowTwo: "rgba(85,182,220,0.13)",
    rangeClass: "accent-[#f3c744]",
    word: "DANIA",
    kicker: "انتخابی برای هر روز و هر بازی",
    title: "کفشی برای هر جور بازی.",
    description: "سبک، منعطف و آماده برای قدم‌هایی که یک‌جا نمی‌مانند.",
  },
  boy: {
    hero: "#0a3154",
    surface: "#eaf5fa",
    accent: "#68c8ee",
    activeText: "#092b48",
    activeTextClass: "!text-[#092b48]",
    glowOne: "rgba(104,200,238,0.25)",
    glowTwo: "rgba(61,123,201,0.2)",
    rangeClass: "accent-[#68c8ee]",
    word: "BOYS",
    kicker: "پسرانه / آماده‌ی حرکت",
    title: "برای بازی‌های بی‌پایان.",
    description: "کفش‌هایی راحت و مقاوم برای دویدن، پریدن و کشف‌کردن.",
  },
  girl: {
    hero: "#51263e",
    surface: "#fff0f2",
    accent: "#ff98a6",
    activeText: "#4b2038",
    activeTextClass: "!text-[#4b2038]",
    glowOne: "rgba(255,152,166,0.24)",
    glowTwo: "rgba(194,115,180,0.16)",
    rangeClass: "accent-[#ff98a6]",
    word: "GIRLS",
    kicker: "دخترانه / رنگ در حرکت",
    title: "راحت برای حرکت؛ جسور در رنگ.",
    description: "مدل‌هایی سبک و خوش‌رنگ برای بازی، خیال‌پردازی و هر روز تازه.",
  },
} as const;

function validCategory(value: string): CategoryKey {
  return value === "girl" || value === "boy" ? value : "all";
}

export function CatalogPage({
  products,
  initialCategory = "all",
}: {
  products: Product[];
  initialCategory?: string;
}) {
  const router = useRouter();
  const [category, setCategory] = useState<CategoryKey>(() => validCategory(initialCategory));
  const [sort, setSort] = useState<SortMode>("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const nextCategory = validCategory(initialCategory);
    setCategory((current) => current === nextCategory ? current : nextCategory);
  }, [initialCategory]);

  const priceBounds = useMemo(() => {
    if (!products.length) return { min: 1_000_000, max: 2_500_000 };

    const prices = products.map((product) => product.price);
    const min = Math.floor(Math.min(...prices) / 100_000) * 100_000;
    const calculatedMax = Math.ceil(Math.max(...prices) / 100_000) * 100_000;

    return { min, max: Math.max(calculatedMax, min + 100_000) };
  }, [products]);

  const [maxPrice, setMaxPrice] = useState(() => priceBounds.max);
  const theme = THEMES[category];

  const categoryCounts = useMemo(
    () => ({
      all: products.length,
      girl: products.filter((product) => product.category === CATEGORY_MAP.girl).length,
      boy: products.filter((product) => product.category === CATEGORY_MAP.boy).length,
    }),
    [products],
  );

  const visible = useMemo(() => {
    const filtered = products.filter((product) => {
      const categoryMatches =
        category === "all" || product.category === CATEGORY_MAP[category];

      return categoryMatches && product.price <= maxPrice;
    });

    if (sort === "low") return [...filtered].sort((a, b) => a.price - b.price);
    if (sort === "high") return [...filtered].sort((a, b) => b.price - a.price);
    return filtered;
  }, [category, maxPrice, products, sort]);

  const activeFilterCount =
    Number(category !== "all") + Number(maxPrice < priceBounds.max);

  useEffect(() => {
    if (!filtersOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFiltersOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [filtersOpen]);

  const changeCategory = (nextCategory: CategoryKey) => {
    setCategory(nextCategory);
    setFiltersOpen(false);
    router.replace(nextCategory === "all" ? "/shop" : `/shop?category=${nextCategory}`, {
      scroll: false,
    });
  };

  const resetFilters = () => {
    setCategory("all");
    setSort("featured");
    setMaxPrice(priceBounds.max);
    setFiltersOpen(false);
    router.replace("/shop", { scroll: false });
  };

  const filterContent = (idPrefix: string) => (
    <>
      <div className="flex items-center justify-between border-b border-[#102b49]/10 pb-5">
        <div>
          <span className="text-[8px] font-black tracking-[0.14em] !text-[#7b8d97]" dir="ltr">
            FILTER / SHOP
          </span>
          <h2 className="mt-1 text-[20px] font-black !text-[#102b49]">فیلتر محصولات</h2>
        </div>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-full px-3 py-2 text-[9px] font-black !text-[#df6f69] transition hover:bg-[#df6f69]/10"
          >
            پاک‌کردن
          </button>
        )}
      </div>

      <fieldset className="mt-6">
        <legend className="mb-3 text-[10px] font-black !text-[#102b49]">دسته‌بندی</legend>
        <div className="space-y-2">
          {CATEGORIES.map((item) => {
            const active = category === item.value;

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => changeCategory(item.value)}
                aria-pressed={active}
                className="flex min-h-12 w-full items-center justify-between rounded-2xl border border-[#102b49]/[0.08] bg-white/50 px-4 text-right transition hover:border-[#102b49]/20 hover:bg-white"
                style={
                  active
                    ? { backgroundColor: theme.accent, color: theme.activeText }
                    : undefined
                }
              >
                <span className={`text-[11px] font-black ${active ? "!text-[inherit]" : "!text-[#334e62]"}`}>
                  {item.label}
                </span>
                <b
                  className={`grid min-w-7 place-items-center rounded-full px-2 py-1 text-[9px] ${
                    active ? "bg-black/10 !text-[inherit]" : "bg-[#102b49]/5 !text-[#6f828e]"
                  }`}
                >
                  {categoryCounts[item.value].toLocaleString("fa-IR")}
                </b>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-7 border-t border-[#102b49]/10 pt-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-[10px] font-black !text-[#102b49]">حداکثر قیمت</h3>
          <strong className="text-[10px] font-black !text-[#102b49]">
            {formatPrice(maxPrice)} <small className="text-[8px] !text-[#7c8d97]">تومان</small>
          </strong>
        </div>

        <label htmlFor={`${idPrefix}-price`} className="sr-only">
          حداکثر قیمت
        </label>
        <input
          id={`${idPrefix}-price`}
          type="range"
          min={priceBounds.min}
          max={priceBounds.max}
          step={100_000}
          value={maxPrice}
          onChange={(event) => setMaxPrice(Number(event.target.value))}
          aria-valuetext={`${formatPrice(maxPrice)} تومان`}
          className={`mt-5 h-1.5 w-full cursor-pointer ${theme.rangeClass}`}
        />
        <div className="mt-3 flex justify-between text-[8px] font-bold !text-[#8798a1]">
          <span>{formatPrice(priceBounds.min)}</span>
          <span>{formatPrice(priceBounds.max)}</span>
        </div>
      </div>

      <div className="mt-7 rounded-[1.4rem] border border-[#102b49]/10 bg-[#102b49]/[0.035] p-4">
        <strong className="text-[10px] font-black !text-[#102b49]">انتخاب سایز مطمئن‌تر</strong>
        <p className="mt-2 text-[9px] leading-6 !text-[#70838e]">
          جزئیات قالب و سایزهای موجود هر مدل را داخل کارت یا صفحه محصول بررسی کن.
        </p>
      </div>
    </>
  );

  return (
    <main className="overflow-hidden bg-[#f7f1e8] text-[#102b49] [font-family:inherit]" dir="rtl">
      <section
        className="relative isolate overflow-hidden pb-28 pt-24 text-[#fff4e3] transition-colors duration-500 sm:pb-32 sm:pt-28"
        style={{ backgroundColor: theme.hero }}
        aria-labelledby="catalog-title"
      >
        <span
          className="pointer-events-none absolute -left-[3vw] top-3 -z-10 whitespace-nowrap text-[clamp(150px,25vw,390px)] font-black leading-none tracking-[-0.09em] text-white/[0.025]"
          aria-hidden="true"
          dir="ltr"
        >
          {theme.word}
        </span>
        <span
          className="pointer-events-none absolute -left-24 top-8 -z-10 size-80 rounded-full blur-3xl transition-colors duration-500"
          style={{ backgroundColor: theme.glowOne }}
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute -right-28 bottom-0 -z-10 size-96 rounded-full blur-3xl transition-colors duration-500"
          style={{ backgroundColor: theme.glowTwo }}
          aria-hidden="true"
        />

        <div className="mx-auto w-[min(1320px,calc(100%_-_2rem))]">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <span
                className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.045] px-4 py-2 text-[9px] font-black backdrop-blur-sm"
                style={{ color: theme.accent }}
              >
                <i className="size-1.5 rounded-full bg-current shadow-[0_0_14px_currentColor]" />
                {theme.kicker}
              </span>
              <h1
                id="catalog-title"
                className="mt-6 max-w-[900px] text-[clamp(44px,6.8vw,88px)] font-black leading-[1.02] tracking-[-0.065em] !text-[#fff4e3]"
              >
                {theme.title}
              </h1>
              <p className="mt-5 max-w-[600px] text-[12px] leading-8 !text-[#c5d5de]/80 sm:text-[14px] sm:leading-9">
                {theme.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 md:justify-end" aria-label="دسته‌بندی محصولات">
              {CATEGORIES.map((item) => {
                const active = category === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => changeCategory(item.value)}
                    aria-pressed={active}
                    className="min-h-11 rounded-full border border-white/15 px-5 text-[10px] font-black transition hover:bg-white/10"
                    style={
                      active
                        ? {
                            backgroundColor: theme.accent,
                            borderColor: theme.accent,
                          }
                        : undefined
                    }
                  >
                    <span className={active ? theme.activeTextClass : "!text-[#fff4e3]"}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section
        className="relative -mt-10 rounded-t-[2.5rem] px-4 pb-20 pt-8 transition-colors duration-500 sm:rounded-t-[3.5rem] sm:px-6 sm:pb-28 sm:pt-10"
        style={{ backgroundColor: theme.surface }}
      >
        <div className="mx-auto max-w-[1320px]">
          <div className="mb-6 flex items-center justify-between gap-3 rounded-[1.4rem] border border-[#102b49]/10 bg-white/65 p-3 shadow-[0_14px_40px_rgba(16,43,73,0.06)] backdrop-blur-sm lg:hidden">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="flex min-h-11 items-center gap-2 rounded-xl bg-[#102b49] px-4 text-[10px] font-black !text-[#fff4e3]"
              aria-haspopup="dialog"
              aria-expanded={filtersOpen}
            >
              <span className="!text-[#fff4e3]">فیلترها</span>
              {activeFilterCount > 0 && (
                <b
                  className="grid size-5 place-items-center rounded-full text-[8px] !text-[#102b49]"
                  style={{ backgroundColor: theme.accent }}
                >
                  {activeFilterCount.toLocaleString("fa-IR")}
                </b>
              )}
            </button>

            <span className="text-[10px] font-black !text-[#536a79]">
              {visible.length.toLocaleString("fa-IR")} محصول
            </span>
          </div>

          <div className="grid gap-8 lg:grid-cols-[270px_minmax(0,1fr)] xl:gap-10">
            <aside className="hidden lg:block">
              <div className="sticky top-28 rounded-[2rem] border border-[#102b49]/10 bg-white/70 p-6 shadow-[0_24px_70px_rgba(16,43,73,0.07)] backdrop-blur-md">
                {filterContent("desktop")}
              </div>
            </aside>

            <div className="min-w-0">
              <div className="mb-7 flex flex-col gap-4 border-b border-[#102b49]/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="text-[9px] font-bold tracking-[0.12em] !text-[#81939d]" dir="ltr">
                    DANIA / SHOP EDIT
                  </span>
                  <p className="mt-1 text-[12px] font-black !text-[#102b49]">
                    {visible.length.toLocaleString("fa-IR")} محصول برای انتخاب
                  </p>
                </div>

                <label className="flex min-h-11 items-center gap-3 rounded-full border border-[#102b49]/10 bg-white/70 px-4 text-[9px] font-bold !text-[#6c7f8a]">
                  مرتب‌سازی
                  <select
                    value={sort}
                    onChange={(event) => setSort(event.target.value as SortMode)}
                    className="cursor-pointer appearance-none bg-transparent pl-4 text-[10px] font-black !text-[#102b49] outline-none [font-family:inherit]"
                  >
                    <option value="featured">پیشنهاد دانیا</option>
                    <option value="low">ارزان‌ترین</option>
                    <option value="high">گران‌ترین</option>
                  </select>
                  <span className="text-[9px] !text-[#8ca0ab]" aria-hidden="true">⌄</span>
                </label>
              </div>

              {visible.length ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 xl:gap-6">
                  {visible.map((product) => (
                    <ProductCard product={product} variant="featured" key={product.id} />
                  ))}
                </div>
              ) : (
                <div className="grid min-h-[420px] place-items-center rounded-[2.2rem] border border-dashed border-[#102b49]/20 bg-white/45 px-6 text-center">
                  <div>
                    <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#102b49]/5 text-xl !text-[#102b49]">
                      ×
                    </span>
                    <h2 className="mt-5 text-[23px] font-black !text-[#102b49]">
                      چیزی با این فیلترها پیدا نشد
                    </h2>
                    <p className="mt-2 text-[11px] leading-7 !text-[#71838e]">
                      بازه قیمت یا دسته‌بندی را تغییر بده.
                    </p>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="mt-6 min-h-11 rounded-full bg-[#102b49] px-6 text-[10px] font-black !text-[#fff4e3]"
                    >
                      <span className="!text-[#fff4e3]">نمایش همه محصولات</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {filtersOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden" role="dialog" aria-modal="true" aria-label="فیلتر محصولات">
          <button
            type="button"
            className="absolute inset-0 bg-[#06152d]/60 backdrop-blur-sm"
            onClick={() => setFiltersOpen(false)}
            aria-label="بستن فیلترها"
          />
          <aside className="absolute inset-x-0 bottom-0 max-h-[88svh] overflow-y-auto rounded-t-[2rem] bg-[#fffaf2] p-5 shadow-[0_-30px_90px_rgba(0,7,24,0.28)]">
            <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-[#102b49]/15" aria-hidden="true" />
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="grid size-10 place-items-center rounded-full border border-[#102b49]/10 bg-white text-lg !text-[#102b49]"
                aria-label="بستن"
              >
                ×
              </button>
            </div>
            {filterContent("mobile")}
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="mt-6 min-h-12 w-full rounded-2xl bg-[#102b49] px-5 text-[11px] font-black !text-[#fff4e3]"
            >
              <span className="!text-[#fff4e3]">
                نمایش {visible.length.toLocaleString("fa-IR")} محصول
              </span>
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}
