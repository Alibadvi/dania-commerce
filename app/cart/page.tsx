"use client";

import Link from "next/link";
import { ArrowLeftIcon, MinusIcon, PlusIcon, ShieldIcon } from "@/components/icons";
import { useCart } from "@/components/cart-provider";
import { formatToman } from "@/lib/money";

export default function CartPage() {
  const { items, subtotal, removeItem, updateQuantity } = useCart();
  const shipping = subtotal >= 3000000 ? 0 : 85000;
  return <main className="page-main shell cart-page">
    <header className="page-hero mini"><p className="eyebrow"><span /> انتخاب‌های شما</p><h1>سبد خرید</h1></header>
    {!items.length ? <div className="empty-state cart-empty"><span>♡</span><h2>سبد شما هنوز خالی‌ست</h2><p>یک جفت برای قدم‌های بعدی پیدا کنیم؟</p><Link className="button button-primary" href="/shop">رفتن به فروشگاه <ArrowLeftIcon /></Link></div> :
    <div className="cart-layout">
      <section className="cart-items" aria-label="محصولات سبد خرید">
        {items.map((item) => <article className="cart-item" key={`${item.slug}-${item.size}`}>
          <Link href={`/product/${item.slug}`} className="cart-item-image"><img src={item.image} alt={item.name} /></Link>
          <div className="cart-item-info"><div><Link href={`/product/${item.slug}`}><h2>{item.name}</h2></Link><p>سایز {new Intl.NumberFormat("fa-IR").format(item.size)}</p></div><strong>{formatToman(item.price * item.quantity)}</strong><div className="cart-item-actions"><div className="quantity"><button onClick={() => updateQuantity(item.slug, item.size, item.quantity - 1)} aria-label="کم کردن تعداد"><MinusIcon /></button><span>{new Intl.NumberFormat("fa-IR").format(item.quantity)}</span><button onClick={() => updateQuantity(item.slug, item.size, item.quantity + 1)} aria-label="زیاد کردن تعداد"><PlusIcon /></button></div><button className="remove" onClick={() => removeItem(item.slug, item.size)}>حذف</button></div></div>
        </article>)}
      </section>
      <aside className="order-summary"><h2>خلاصه سفارش</h2><div><span>جمع کالاها</span><b>{formatToman(subtotal)}</b></div><div><span>هزینه ارسال</span><b>{shipping ? formatToman(shipping) : "رایگان"}</b></div><form><input placeholder="کد تخفیف" /><button>اعمال</button></form><div className="summary-total"><span>مبلغ قابل پرداخت</span><strong>{formatToman(subtotal + shipping)}</strong></div><Link className="button button-primary" href="/checkout">ادامه و ثبت سفارش <ArrowLeftIcon /></Link><p><ShieldIcon /> پرداخت امن از درگاه بانکی</p></aside>
    </div>}
  </main>;
}
