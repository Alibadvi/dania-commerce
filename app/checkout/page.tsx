"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, ShieldIcon } from "@/components/icons";
import { useCart } from "@/components/cart-provider";
import { formatToman } from "@/lib/money";

export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const [notice, setNotice] = useState("");
  function submit(event: FormEvent) { event.preventDefault(); setNotice("در نسخه‌ی نمایشی، اتصال نهایی زرین‌پال پس از دریافت Merchant ID فعال می‌شود."); }
  if (!items.length) return <main className="page-main shell"><div className="empty-state cart-empty"><h1>سفارشی برای پرداخت ندارید</h1><Link className="button button-primary" href="/shop">بازگشت به فروشگاه</Link></div></main>;
  return <main className="page-main checkout-page"><div className="shell checkout-heading"><Link href="/cart">→ بازگشت به سبد</Link><div><span className="active">۱. اطلاعات ارسال</span><i /><span>۲. پرداخت</span></div></div>
    <form className="shell checkout-layout" onSubmit={submit}>
      <section className="checkout-form"><p className="eyebrow"><span /> مقصد قدم‌های کوچک</p><h1>اطلاعات ارسال</h1><div className="form-grid"><label><span>نام و نام خانوادگی</span><input required placeholder="مثلاً سارا احمدی" /></label><label><span>شماره موبایل</span><input required inputMode="tel" placeholder="۰۹۱۲ ۱۲۳ ۴۵۶۷" /></label><label><span>استان</span><select required defaultValue=""><option value="" disabled>انتخاب استان</option><option>تهران</option><option>البرز</option><option>اصفهان</option><option>فارس</option></select></label><label><span>شهر</span><input required placeholder="شهر" /></label><label className="full"><span>آدرس کامل</span><textarea required placeholder="خیابان، کوچه، پلاک، واحد" /></label><label><span>کد پستی</span><input required inputMode="numeric" placeholder="۱۰ رقم" /></label></div><h2>روش ارسال</h2><label className="shipping-option"><input type="radio" name="shipping" defaultChecked /><span><b>ارسال استاندارد</b><small>۲ تا ۴ روز کاری</small></span><strong>رایگان</strong></label></section>
      <aside className="order-summary checkout-summary"><h2>سفارش شما</h2>{items.map((item) => <div className="checkout-item" key={`${item.slug}-${item.size}`}><img src={item.image} alt="" /><span><b>{item.name}</b><small>سایز {new Intl.NumberFormat("fa-IR").format(item.size)} · تعداد {new Intl.NumberFormat("fa-IR").format(item.quantity)}</small></span><strong>{formatToman(item.price * item.quantity)}</strong></div>)}<div className="summary-total"><span>مبلغ قابل پرداخت</span><strong>{formatToman(subtotal)}</strong></div><button className="button button-primary" type="submit">پرداخت با زرین‌پال <ArrowLeftIcon /></button><p><ShieldIcon /> انتقال امن به صفحه‌ی زرین‌پال</p>{notice && <div className="checkout-notice" role="status">{notice}</div>}</aside>
    </form>
  </main>;
}
