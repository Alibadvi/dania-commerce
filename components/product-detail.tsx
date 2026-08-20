"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { formatPrice } from "@/lib/catalog";
import { HeartIcon, RefreshIcon, RulerIcon, ShieldIcon, TruckIcon } from "@/components/icons";
import { useShop } from "@/components/shop-shell";

export function ProductDetail({ product }: { product: Product }) {
  const [size, setSize] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [notice, setNotice] = useState(false);
  const { addToCart } = useShop();
  const submit = () => {
    if (!size) { setNotice(true); return; }
    const variant = product.variants.find((item) => item.size === size);
    if (!variant) { setNotice(true); return; }
    void addToCart(variant.id).catch(() => undefined);
  };
  return <main className="product-detail-page"><div className="container breadcrumbs"><Link href="/">خانه</Link><span>/</span><Link href="/shop">فروشگاه</Link><span>/</span><b>{product.name}</b></div><section className="container product-detail">
    <div className="product-gallery"><div className={`detail-image product-image ${product.imagePosition}`}><span className="zoom-label">برای بزرگ‌نمایی کلیک کن</span></div><div className="gallery-thumbs"><button className={`product-image ${product.imagePosition} active`} aria-label="نمای اصلی"/><button className="material-thumb">انعطاف<br/>بالا</button><button className="sole-thumb">زیره‌ی<br/>ضدلغزش</button></div></div>
    <div className="detail-copy"><span className="product-category">{product.category} / کالکشن روزمره</span><h1>{product.name}</h1><p className="detail-subtitle">{product.description}</p><div className="detail-price">{product.oldPrice && <del>{formatPrice(product.oldPrice)}</del>}<strong>{formatPrice(product.price)}</strong><span>تومان</span></div><div className="divider"/><div className="size-heading"><strong>انتخاب سایز</strong><a href="#guide"><RulerIcon/>راهنمای سایز</a></div><div className="size-options">{product.sizes.map((item) => <button key={item} className={size === item ? "active" : ""} onClick={() => { setSize(item); setNotice(false); }}>{item.toLocaleString("fa-IR")}</button>)}</div>{notice && <p className="size-error">اول یک سایز موجود انتخاب کن.</p>}<div className="detail-actions"><button className="button primary grow" onClick={submit} disabled={!product.variants.length}>افزودن به سبد خرید</button><button className={`button icon-only ${liked ? "is-liked" : ""}`} onClick={() => setLiked(!liked)} aria-label="علاقه‌مندی"><HeartIcon/></button></div><div className="product-promises"><div><TruckIcon/><span><strong>ارسال سریع</strong>۱ تا ۳ روز کاری</span></div><div><RefreshIcon/><span><strong>تعویض سایز</strong>تا ۷ روز</span></div><div><ShieldIcon/><span><strong>ضمانت اصالت</strong>و کیفیت کالا</span></div></div><details open><summary>ویژگی‌های محصول</summary><ul><li>رویه‌ی مشبک و قابل تنفس</li><li>کفی نرم با قابلیت جذب ضربه</li><li>زیره‌ی سبک، منعطف و ضدلغزش</li><li>بستن آسان با چسب و کش</li></ul></details><details><summary>نگهداری و شست‌وشو</summary><p>با دستمال مرطوب تمیز شود. از ماشین لباسشویی و گرمای مستقیم استفاده نکنید.</p></details></div>
  </section></main>;
}
