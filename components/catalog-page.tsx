"use client";

import { useMemo, useState } from "react";
import { products } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";

const categoryMap: Record<string, string> = { girl: "دخترانه", boy: "پسرانه", baby: "نوزادی" };

export function CatalogPage({ initialCategory = "all" }: { initialCategory?: string }) {
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState("featured");
  const [maxPrice, setMaxPrice] = useState(2500000);

  const visible = useMemo(() => {
    const filtered = products.filter((product) => (category === "all" || product.category === categoryMap[category]) && product.price <= maxPrice);
    if (sort === "low") return [...filtered].sort((a, b) => a.price - b.price);
    if (sort === "high") return [...filtered].sort((a, b) => b.price - a.price);
    return filtered;
  }, [category, sort, maxPrice]);

  return <main className="catalog-main"><section className="catalog-hero"><div className="container"><span className="eyebrow">کفش مناسب هر بازی</span><h1>فروشگاه دانیا</h1><p>سبک، انعطاف‌پذیر و ساخته‌شده برای روزهای پرتحرک.</p></div></section><section className="container catalog-layout">
    <aside className="filters"><h2>فیلترها</h2><div className="filter-group"><h3>دسته‌بندی</h3>{[["all", "همه کفش‌ها"], ["girl", "دخترانه"], ["boy", "پسرانه"], ["baby", "اولین قدم"]].map(([value, label]) => <button key={value} className={category === value ? "active" : ""} onClick={() => setCategory(value)}><span>{label}</span><b>{(value === "all" ? products.length : products.filter((p) => p.category === categoryMap[value]).length).toLocaleString("fa-IR")}</b></button>)}</div><div className="filter-group"><h3>حداکثر قیمت</h3><input type="range" min="1500000" max="2500000" step="100000" value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))}/><div className="range-label"><span>۱.۵ میلیون</span><strong>{(maxPrice / 1000000).toLocaleString("fa-IR", { maximumFractionDigits: 1 })} میلیون</strong></div></div><div className="filter-note">برای انتخاب سایز مطمئن نیستی؟<a href="#size-guide">راهنمای اندازه‌گیری پا</a></div></aside>
    <div className="catalog-results"><div className="catalog-toolbar"><span>{visible.length.toLocaleString("fa-IR")} محصول</span><label>مرتب‌سازی <select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">پیشنهاد دانیا</option><option value="low">ارزان‌ترین</option><option value="high">گران‌ترین</option></select></label></div>{visible.length ? <div className="product-grid catalog-grid">{visible.map((product) => <ProductCard product={product} key={product.id}/>)}</div> : <div className="no-results"><h3>چیزی در این بازه پیدا نشد</h3><p>فیلتر قیمت را کمی بازتر کن.</p></div>}</div>
  </section></main>;
}
