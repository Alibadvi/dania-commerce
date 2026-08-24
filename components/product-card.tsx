"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/catalog";
import { formatPrice } from "@/lib/catalog";
import { HeartIcon } from "@/components/icons";
import { useShop } from "@/components/shop-shell";

type ProductCardProps = {
  product: Product;
  variant?: "default" | "featured";
};

const COLOR_SWATCHES: Record<string, string> = {
  "آبی": "#4f86d9",
  "مرجانی": "#ef8176",
  "سبز": "#9bc43c",
  "صورتی": "#ee9eb1",
  "کرم": "#e8d8bf",
  "سرمه‌ای": "#183457",
  "یاسی": "#ad91d3",
  "زرد": "#efc437",
};

const PERSIAN_FONT_STACK =
  '"Vazirmatn Variable", Vazirmatn, Tahoma, Arial, sans-serif';

export function ProductCard({ product, variant = "default" }: ProductCardProps) {
  const [liked, setLiked] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState(
    () => product.variants[0]?.id ?? "",
  );
  const [adding, setAdding] = useState(false);
  const { addToCart } = useShop();
  const firstVariant = product.variants[0];
  const selectedVariant =
    product.variants.find((item) => item.id === selectedVariantId) ?? firstVariant;

  const addVariant = async (variantId?: string) => {
    if (!variantId || adding) return;
    setAdding(true);
    try {
      await addToCart(variantId);
    } catch {
      return;
    } finally {
      setAdding(false);
    }
  };

  if (variant === "featured") {
    return (
      <article
        className="group flex h-full min-w-0 flex-col rounded-[2.15rem] border border-[#122844]/[0.08] bg-[#f6efe6] p-3 text-[#122844] shadow-[0_28px_70px_rgba(0,7,24,0.2)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_36px_90px_rgba(0,7,24,0.28)] focus-within:-translate-y-1"
        dir="rtl"
        style={{ fontFamily: PERSIAN_FONT_STACK }}
      >
        <div className="relative aspect-[4/4.2] overflow-hidden rounded-[1.7rem] bg-[#fffaf4]">
          <Link
            href={`/product/${product.slug}`}
            className={`product-image ${product.imagePosition} !absolute !inset-0 !z-0 !block transition duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04] group-focus-within:scale-[1.04]`}
            aria-label={product.name}
          />

          {product.badge && (
            <span className="absolute right-4 top-4 z-10 rounded-full border border-[#122844]/10 bg-white/85 px-3 py-2 text-[9px] font-black text-[#122844] shadow-sm backdrop-blur-md">
              {product.badge}
            </span>
          )}

          <button
            type="button"
            aria-label={liked ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
            aria-pressed={liked}
            onClick={() => setLiked((current) => !current)}
            className={`absolute left-4 top-4 z-10 grid size-11 place-items-center rounded-full border bg-white/85 shadow-[0_8px_24px_rgba(18,40,68,0.1)] backdrop-blur-md transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d9a719] ${
              liked
                ? "border-[#ff9187]/70 text-[#ef6f68]"
                : "border-[#122844]/10 text-[#122844]"
            }`}
          >
            <span className={`block size-[18px] [&>svg]:size-full ${liked ? "[&>svg]:fill-current" : ""}`}>
              <HeartIcon />
            </span>
          </button>

        </div>

        <div className="flex flex-1 flex-col px-2 pb-2 pt-5">
          <div className="mb-3 flex items-center gap-2 text-[8px] font-bold text-[#122844]/45">
            <span>{product.category}</span>
            <span className="size-1 rounded-full bg-[#122844]/20" aria-hidden="true" />
            <span className="inline-flex items-center gap-1.5">
              <i
                className="size-2.5 rounded-full border border-[#122844]/20"
                style={{ backgroundColor: COLOR_SWATCHES[product.color] ?? "#c5ccd2" }}
                aria-hidden="true"
              />
              {product.color}
            </span>
          </div>

          <div className="flex items-start justify-between gap-5">
            <div className="min-w-0 text-right">
              <Link
                href={`/product/${product.slug}`}
                className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d9a719]"
              >
                <h3 className="truncate text-[19px] font-black text-[#122844]">
                  {product.name}
                </h3>
              </Link>
              <p className="mt-1 text-[10px] text-[#122844]/50">{product.subtitle}</p>
            </div>

            <div className="flex shrink-0 flex-col items-end text-left" dir="ltr">
              {product.oldPrice && (
                <del className="mb-1 text-[9px] text-[#122844]/35">
                  {formatPrice(product.oldPrice)}
                </del>
              )}
              <span className="flex items-baseline gap-1.5">
                <strong className="text-[14px] font-black text-[#122844]">
                  {formatPrice(product.price)}
                </strong>
                <small className="text-[8px] font-bold text-[#b28716]">تومان</small>
              </span>
            </div>
          </div>

          <p className="mt-4 line-clamp-2 min-h-12 text-[10px] leading-6 text-[#122844]/55">
            {product.description}
          </p>

          <div className="mt-4 flex items-stretch gap-2 border-t border-[#122844]/10 pt-4">
            <label className="relative flex h-12 w-[104px] shrink-0 items-center rounded-2xl border border-[#122844]/10 bg-white/70 px-3 !text-[#122844] transition focus-within:border-[#d9a719]/60 focus-within:ring-1 focus-within:ring-[#d9a719]/40">
              <span className="ml-2 whitespace-nowrap text-[9px] font-bold !text-[#122844]/45">
                سایز
              </span>
              <select
                value={selectedVariant?.id ?? ""}
                onChange={(event) => setSelectedVariantId(event.target.value)}
                aria-label={`انتخاب سایز ${product.name}`}
                className="h-full min-w-0 flex-1 appearance-none bg-transparent pl-4 text-center text-[12px] font-black !text-[#122844] outline-none [font-family:inherit] [&>option]:bg-[#fffaf4] [&>option]:text-[#06152d]"
              >
                {product.variants.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                    disabled={item.stockLevel !== "IN_STOCK"}
                  >
                    {item.size}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute left-3 text-[10px] text-[#122844]/40" aria-hidden="true">⌄</span>
            </label>

            <button
              type="button"
              dir="rtl"
              disabled={!selectedVariant || selectedVariant.stockLevel !== "IN_STOCK" || adding}
              onClick={() => void addVariant(selectedVariant?.id)}
              className="flex h-12 min-w-0 flex-1 items-center justify-center gap-3 rounded-2xl bg-[#122844] px-3 !text-[#fff2df] shadow-[0_10px_24px_rgba(18,40,68,0.16)] transition hover:-translate-y-0.5 hover:bg-[#1a3b60] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d9a719] disabled:cursor-not-allowed disabled:opacity-40 [font-family:inherit]"
            >
              <span className="whitespace-nowrap !text-[12px] font-extrabold leading-none !text-[#fff2df]">
                {adding ? "در حال افزودن…" : "افزودن به سبد خرید"}
              </span>
              <span
                className="-mt-px text-[18px] font-light leading-none !text-[#f5c542]"
                aria-hidden="true"
              >
                +
              </span>
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="product-card">
      <div className="product-media">
        <Link
          href={`/product/${product.slug}`}
          className={`product-image ${product.imagePosition}`}
          aria-label={product.name}
        />
        {product.badge && <span className="product-badge">{product.badge}</span>}
        <button
          type="button"
          className={`heart-button ${liked ? "is-liked" : ""}`}
          aria-label={liked ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
          aria-pressed={liked}
          onClick={() => setLiked((current) => !current)}
        >
          <HeartIcon />
        </button>
        <button
          type="button"
          className="quick-add"
          disabled={!firstVariant}
          onClick={() => void addVariant(firstVariant?.id)}
        >
          افزودن سریع
        </button>
      </div>

      <div className="product-info">
        <div>
          <Link href={`/product/${product.slug}`}>
            <h3>{product.name}</h3>
          </Link>
          <p>{product.subtitle}</p>
        </div>
        <div className="product-price">
          {product.oldPrice && <del>{formatPrice(product.oldPrice)}</del>}
          <strong>{formatPrice(product.price)}</strong>
          <small>تومان</small>
        </div>
      </div>
    </article>
  );
}