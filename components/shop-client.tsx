"use client";

import { useMemo, useState } from "react";
import { products } from "@/lib/catalog";
import { ProductCard } from "./product-card";
import { SearchIcon } from "./icons";

const filters = [
  { key: "all", label: "همه" },
  { key: "everyday", label: "روزمره" },
  { key: "play", label: "بازی و حرکت" },
  { key: "party", label: "مهمانی" },
] as const;

export function ShopClient() {
  const [filter, setFilter] = useState<(typeof filters)[number]["key"]>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const visible = useMemo(() => {
    const result = products.filter((item) => (filter === "all" || item.category === filter) && item.name.includes(search.trim()));
    return [...result].sort((a, b) => sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : 0);
  }, [filter, search, sort]);

  return <>
    <div className="shop-toolbar">
      <div className="filter-chips" role="group" aria-label="دسته‌بندی محصولات">
        {filters.map((item) => <button key={item.key} className={filter === item.key ? "active" : ""} onClick={() => setFilter(item.key)}>{item.label}</button>)}
      </div>
      <div className="shop-tools">
        <label className="shop-search"><SearchIcon /><input value={search} onInput={(event) => setSearch(event.currentTarget.value)} placeholder="جستجوی مدل..." aria-label="جستجوی محصولات" /></label>
        <label className="sort-select"><span>مرتب‌سازی:</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">پیشنهادی</option><option value="low">کمترین قیمت</option><option value="high">بیشترین قیمت</option></select></label>
      </div>
    </div>
    <div className="results-line"><span>{new Intl.NumberFormat("fa-IR").format(visible.length)} محصول</span><i /></div>
    {visible.length ? <div className="product-grid shop-grid">{visible.map((product) => <ProductCard key={product.slug} product={product} />)}</div> : <div className="empty-state"><h2>مدلی پیدا نشد</h2><p>عبارت دیگری را امتحان کنید.</p></div>}
  </>;
}
