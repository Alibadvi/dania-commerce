"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ShieldIcon } from "@/components/icons";
import { useShop } from "@/components/shop-shell";
import { formatPrice } from "@/lib/catalog";
import type { CartOrder, CheckoutInput, CheckoutResult, CustomerDashboard, ShippingMethod } from "@/lib/commerce-types";

type ShippingResponse = { methods?: ShippingMethod[]; error?: { message?: string } };
type CheckoutResponse = CheckoutResult & { error?: { message?: string } };
type AccountResponse = { dashboard?: CustomerDashboard | null };

export function CheckoutPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const { cart, order, cartBusy, applyCoupon, replaceOrder } = useShop();
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [shippingMethodId, setShippingMethodId] = useState("");
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [completed, setCompleted] = useState<{ order: CartOrder; paymentMode: CheckoutResult["paymentMode"] } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/commerce?resource=account", { credentials: "same-origin", cache: "no-store" })
      .then(async (response) => response.ok ? await response.json() as AccountResponse : null)
      .then((payload) => {
        if (cancelled || !payload?.dashboard || !formRef.current) return;
        const { customer, addresses } = payload.dashboard;
        const address = addresses.find((item) => item.defaultShippingAddress) ?? addresses[0];
        const values: Record<string, string | null | undefined> = {
          fullName: address?.fullName ?? `${customer.firstName} ${customer.lastName}`.trim(),
          emailAddress: customer.emailAddress,
          phoneNumber: address?.phoneNumber ?? customer.phoneNumber,
          province: address?.province,
          city: address?.city,
          streetLine1: address?.streetLine1,
          postalCode: address?.postalCode,
        };
        for (const [name, value] of Object.entries(values)) {
          const field = formRef.current?.elements.namedItem(name);
          if ((field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) && !field.value && value) field.value = value;
        }
      })
      .catch(() => { /* Guest checkout remains available while account data is unavailable. */ });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!cart.length) return;
    let cancelled = false;
    setLoadingShipping(true);
    fetch("/api/commerce?resource=shipping", { credentials: "same-origin", cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json() as ShippingResponse;
        if (!response.ok) throw new Error(payload.error?.message ?? "روش‌های ارسال دریافت نشد.");
        if (!cancelled) {
          const methods = payload.methods ?? [];
          setShippingMethods(methods);
          setShippingMethodId((current) => current && methods.some((item) => item.id === current) ? current : methods[0]?.id ?? "");
        }
      })
      .catch((reason: unknown) => { if (!cancelled) setError(reason instanceof Error ? reason.message : "روش‌های ارسال دریافت نشد."); })
      .finally(() => { if (!cancelled) setLoadingShipping(false); });
    return () => { cancelled = true; };
  }, [cart.length, order?.subTotal]);

  const selectedShipping = useMemo(() => shippingMethods.find((method) => method.id === shippingMethodId), [shippingMethods, shippingMethodId]);
  const payable = (order?.subTotal ?? 0) + (selectedShipping?.priceWithTax ?? 0);

  async function submitCheckout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!shippingMethodId) { setError("یک روش ارسال انتخاب کنید."); return; }
    setSubmitting(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const checkout: CheckoutInput = {
      fullName: String(form.get("fullName") ?? ""), emailAddress: String(form.get("emailAddress") ?? ""), phoneNumber: String(form.get("phoneNumber") ?? ""),
      province: String(form.get("province") ?? ""), city: String(form.get("city") ?? ""), streetLine1: String(form.get("streetLine1") ?? ""),
      postalCode: String(form.get("postalCode") ?? ""), orderNote: String(form.get("orderNote") ?? ""), shippingMethodId,
    };
    try {
      const response = await fetch("/api/commerce", { method: "POST", headers: { "content-type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ action: "checkout.place", checkout }) });
      const payload = await response.json() as CheckoutResponse;
      if (!response.ok) throw new Error(payload.error?.message ?? "ثبت سفارش انجام نشد.");
      setCompleted({ order: payload.order, paymentMode: payload.paymentMode });
      replaceOrder(payload.order.active ? payload.order : null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "ثبت سفارش انجام نشد.");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitCoupon() {
    setCouponMessage(null);
    try { await applyCoupon(couponCode); setCouponMessage("کد تخفیف روی سبد اعمال شد."); }
    catch (reason) { setCouponMessage(reason instanceof Error ? reason.message : "کد تخفیف اعمال نشد."); }
  }

  if (completed) {
    const paid = completed.paymentMode === "dummy" && !completed.order.active;
    return <main className="checkout-success"><div><span className="success-mark">✓</span><span className="eyebrow">{paid ? "سفارش با موفقیت ثبت شد" : "سفارش آماده پرداخت است"}</span><h1>ممنون! قدم‌های تازه در راه‌اند.</h1><p>شماره سفارش: <strong dir="ltr">{completed.order.code}</strong></p>{completed.paymentMode === "provider-required" && <p className="commerce-alert">برای دریافت وجه واقعی، افزونه درگاه بانکی و کلیدهای پذیرنده باید در محیط production تنظیم شوند. سفارش تا آن زمان در مرحله پرداخت باقی می‌ماند.</p>}<Link href="/shop" className="button primary">ادامه خرید</Link></div></main>;
  }

  return (
    <main className="checkout-page">
      <div className="container checkout-heading"><span className="eyebrow">مرحله آخر</span><h1>تکمیل سفارش</h1></div>
      <div className="container checkout-layout">
        <form ref={formRef} className="checkout-form" onSubmit={submitCheckout}>
          {error && <div className="commerce-alert" role="alert">{error}</div>}
          <section><div className="form-section-heading"><b>۱</b><div><h2>مشخصات تحویل‌گیرنده</h2><p>اگر وارد حساب باشی، آدرس پیش‌فرضت خودکار تکمیل می‌شود.</p></div></div><div className="form-grid">
            <label>نام و نام خانوادگی<input name="fullName" required autoComplete="name" maxLength={100} placeholder="مثلاً علی رضایی"/></label>
            <label>شماره موبایل<input name="phoneNumber" required autoComplete="tel" inputMode="tel" dir="ltr" maxLength={20} placeholder="09120000000"/></label>
            <label className="full">ایمیل<input name="emailAddress" required autoComplete="email" inputMode="email" dir="ltr" maxLength={254} placeholder="you@example.com"/></label>
            <label>استان<input name="province" required autoComplete="address-level1" maxLength={80} placeholder="تهران"/></label>
            <label>شهر<input name="city" required autoComplete="address-level2" maxLength={80} placeholder="تهران"/></label>
            <label className="full">آدرس کامل<textarea name="streetLine1" required autoComplete="street-address" maxLength={300} rows={3} placeholder="خیابان، کوچه، پلاک و واحد"/></label>
            <label>کد پستی<input name="postalCode" required autoComplete="postal-code" inputMode="numeric" dir="ltr" maxLength={20} placeholder="10 رقمی"/></label>
            <label>توضیحات سفارش<input name="orderNote" maxLength={500} placeholder="اختیاری"/></label>
          </div></section>
          <section><div className="form-section-heading"><b>۲</b><div><h2>روش ارسال</h2><p>هزینه‌ها مستقیماً توسط موتور سفارش محاسبه می‌شوند.</p></div></div><div className="delivery-options">{loadingShipping && <p>در حال دریافت روش‌های ارسال…</p>}{!loadingShipping && shippingMethods.map((method) => <label key={method.id} className={shippingMethodId === method.id ? "active" : ""}><input type="radio" name="shippingMethod" value={method.id} checked={shippingMethodId === method.id} onChange={() => setShippingMethodId(method.id)}/><span><strong>{method.name}</strong><small>{method.description}</small></span><b>{method.priceWithTax ? `${formatPrice(method.priceWithTax)} تومان` : "رایگان"}</b></label>)}</div></section>
          <section><div className="form-section-heading"><b>۳</b><div><h2>پرداخت</h2><p>محیط محلی از پرداخت آزمایشی استفاده می‌کند؛ production فقط با درگاه واقعی تکمیل می‌شود.</p></div></div><div className="payment-placeholder"><ShieldIcon/><span><strong>پرداخت امن</strong><small>نشست سبد در کوکی HttpOnly نگه‌داری می‌شود</small></span></div></section>
          <button className="button primary wide checkout-submit" type="submit" disabled={!cart.length || submitting || loadingShipping || !shippingMethodId}>{submitting ? "در حال ثبت سفارش…" : cart.length ? `ثبت سفارش ${formatPrice(payable)} تومان` : "سبد خرید خالی است"}</button>
        </form>
        <aside className="order-summary"><h2>خلاصه سفارش</h2>{cartBusy && !order ? <div className="summary-empty"><p>در حال همگام‌سازی سبد…</p></div> : cart.length === 0 ? <div className="summary-empty"><p>هنوز محصولی انتخاب نکرده‌ای.</p><Link href="/shop">رفتن به فروشگاه</Link></div> : cart.map((line) => <div className="summary-line" key={line.id}><div className={`summary-thumb product-image ${line.imagePosition}`}/><div><strong>{line.productName}</strong><span>سایز {line.size.toLocaleString("fa-IR")} · {line.quantity.toLocaleString("fa-IR")} عدد</span></div><b>{formatPrice(line.linePrice)}</b></div>)}<div className="summary-totals"><p><span>جمع محصولات</span><b>{formatPrice(order?.subTotal ?? 0)} تومان</b></p><p><span>هزینه ارسال</span><b>{selectedShipping?.priceWithTax ? `${formatPrice(selectedShipping.priceWithTax)} تومان` : "رایگان"}</b></p><p className="grand-total"><span>مبلغ نهایی</span><b>{formatPrice(payable)} تومان</b></p></div><div className="promo-form"><input value={couponCode} onChange={(event) => setCouponCode(event.target.value)} dir="ltr" maxLength={32} placeholder="کد تخفیف"/><button type="button" disabled={!couponCode.trim() || cartBusy} onClick={() => void submitCoupon()}>اعمال</button></div>{couponMessage && <p className="coupon-message" role="status">{couponMessage}</p>}</aside>
      </div>
    </main>
  );
}
