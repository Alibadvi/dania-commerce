"use client";

import { useState } from "react";
import type { Product } from "@/lib/catalog";
import { useCart } from "./cart-provider";
import { BagIcon, HeartIcon, RulerIcon, ShieldIcon } from "./icons";

export function ProductConfigurator({ product }: { product: Product }) {
  const [size, setSize] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const { addItem } = useCart();
  function add() {
    if (!size) { setMessage("لطفاً اول سایز را انتخاب کنید."); return; }
    addItem({ slug: product.slug, name: product.name, price: product.price, image: product.image, size });
    setMessage("به سبد خرید اضافه شد ♡");
  }
  return <div className="product-config">
    <div className="size-title"><strong>انتخاب سایز</strong><a href="/size-guide"><RulerIcon /> راهنمای سایز</a></div>
    <div className="size-options">{product.sizes.map((item) => <button key={item} className={size === item ? "active" : ""} onClick={() => { setSize(item); setMessage(""); }}>{new Intl.NumberFormat("fa-IR").format(item)}</button>)}</div>
    <p className="size-hint">سایزها بر اساس استاندارد اروپا هستند.</p>
    <div className="product-actions"><button className="button button-primary" onClick={add}><BagIcon /> افزودن به سبد خرید</button><button className="heart-large" aria-label="افزودن به علاقه‌مندی‌ها"><HeartIcon /></button></div>
    {message && <p className="cart-message" role="status">{message}</p>}
    <div className="purchase-notes"><span><ShieldIcon /> ۷ روز ضمانت تعویض سایز</span><span>● ارسال امروز برای تهران</span></div>
  </div>;
}
