"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { ShieldIcon, UserIcon } from "@/components/icons";
import { formatPrice } from "@/lib/catalog";
import type { CustomerAccount, CustomerAddress, CustomerDashboard } from "@/lib/commerce-types";

type AccountResponse = {
  customer?: CustomerAccount | null;
  dashboard?: CustomerDashboard | null;
  registered?: boolean;
  changed?: boolean;
  error?: { message?: string };
};
type DashboardTab = "overview" | "addresses" | "orders" | "security";

const tabs: Array<{ id: DashboardTab; label: string; description: string }> = [
  { id: "overview", label: "مشخصات من", description: "نام و شماره تماس" },
  { id: "addresses", label: "آدرس‌ها", description: "تحویل سریع‌تر" },
  { id: "orders", label: "سفارش‌ها", description: "تاریخچه خرید" },
  { id: "security", label: "امنیت", description: "تغییر رمز عبور" },
];

const orderStates: Record<string, string> = {
  AddingItems: "در حال تکمیل",
  ArrangingPayment: "در انتظار پرداخت",
  PaymentAuthorized: "پرداخت تأیید شده",
  PaymentSettled: "پرداخت شده",
  PartiallyShipped: "بخشی ارسال شده",
  Shipped: "ارسال شده",
  Delivered: "تحویل شده",
  Cancelled: "لغو شده",
};

async function accountRequest(body?: Record<string, unknown>): Promise<AccountResponse> {
  const response = await fetch(body ? "/api/commerce" : "/api/commerce?resource=account", {
    method: body ? "POST" : "GET",
    credentials: "same-origin",
    cache: "no-store",
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json() as AccountResponse;
  if (!response.ok) throw new Error(payload.error?.message ?? "درخواست حساب انجام نشد.");
  return payload;
}

function addressLabel(address: CustomerAddress): string {
  return [address.province, address.city, address.streetLine1].filter(Boolean).join("، ");
}

export function AccountPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [dashboard, setDashboard] = useState<CustomerDashboard | null>(null);
  const [tab, setTab] = useState<DashboardTab>("overview");
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function reloadDashboard() {
    const payload = await accountRequest();
    setDashboard(payload.dashboard ?? null);
  }

  useEffect(() => {
    let cancelled = false;
    accountRequest()
      .then((payload) => { if (!cancelled) setDashboard(payload.dashboard ?? null); })
      .catch(() => { /* The sign-in form remains available while commerce starts. */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  async function runAction(body: Record<string, unknown>, success: string) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const payload = await accountRequest(body);
      if (payload.dashboard) setDashboard(payload.dashboard);
      if (success) setNotice(success);
      return true;
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "درخواست انجام نشد.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "login") {
        await accountRequest({ action: "auth.login", credentials: { emailAddress: form.get("emailAddress"), password: form.get("password") } });
        await reloadDashboard();
      } else {
        await accountRequest({ action: "auth.register", customer: { firstName: form.get("firstName"), lastName: form.get("lastName"), emailAddress: form.get("emailAddress"), password: form.get("password") } });
        formElement.reset();
        setMode("login");
        setNotice("حساب ساخته شد. حالا وارد شوید؛ در محیط اصلی ممکن است تأیید ایمیل لازم باشد.");
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "درخواست انجام نشد.");
    } finally {
      setBusy(false);
    }
  }

  async function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await runAction({ action: "account.profile.update", customer: { firstName: form.get("firstName"), lastName: form.get("lastName"), phoneNumber: form.get("phoneNumber") } }, "مشخصات حساب ذخیره شد.");
  }

  async function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    if (form.get("newPassword") !== form.get("confirmPassword")) {
      setError("تکرار رمز جدید با رمز جدید یکسان نیست.");
      return;
    }
    const changed = await runAction({ action: "account.password.update", passwords: { currentPassword: form.get("currentPassword"), newPassword: form.get("newPassword") } }, "رمز عبور با موفقیت تغییر کرد.");
    if (changed) formElement.reset();
  }

  async function submitAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const address = {
      ...(editingAddress?.id ? { id: editingAddress.id } : {}),
      fullName: form.get("fullName"), phoneNumber: form.get("phoneNumber"), province: form.get("province"), city: form.get("city"),
      streetLine1: form.get("streetLine1"), streetLine2: form.get("streetLine2"), postalCode: form.get("postalCode"),
      defaultShippingAddress: form.get("defaultShippingAddress") === "on",
    };
    const saved = await runAction({ action: editingAddress?.id ? "account.address.update" : "account.address.create", address }, editingAddress?.id ? "آدرس ویرایش شد." : "آدرس جدید ذخیره شد.");
    if (saved) setEditingAddress(undefined);
  }

  async function deleteAddress(address: CustomerAddress) {
    if (!window.confirm("این آدرس حذف شود؟")) return;
    const deleted = await runAction({ action: "account.address.delete", addressId: address.id }, "آدرس حذف شد.");
    if (deleted && editingAddress?.id === address.id) setEditingAddress(undefined);
  }

  async function logout() {
    const loggedOut = await runAction({ action: "auth.logout" }, "");
    if (loggedOut) { setDashboard(null); setNotice(null); setTab("overview"); }
  }

  const defaultAddress = useMemo(() => dashboard?.addresses.find((address) => address.defaultShippingAddress) ?? dashboard?.addresses[0], [dashboard]);

  if (loading) return <main className="account-page"><div className="account-loading">در حال بررسی حساب…</div></main>;

  if (dashboard) {
    const customer = dashboard.customer;
    return (
      <main className="account-page customer-account-page">
        <section className="customer-dashboard">
          <header className="customer-dashboard-head"><div><span className="eyebrow">حساب من</span><h1>سلام {customer.firstName || "دوست دانیا"}</h1><p>مشخصات، آدرس‌ها و سفارش‌هایت را اینجا مدیریت کن.</p></div><Link className="button dark" href="/shop">ادامه خرید</Link></header>
          <div className="account-dashboard-grid">
            <aside className="account-dashboard-nav" aria-label="بخش‌های حساب"><div className="account-avatar"><UserIcon/><span><strong>{customer.firstName} {customer.lastName}</strong><small dir="ltr">{customer.emailAddress}</small></span></div><nav>{tabs.map((item) => <button type="button" key={item.id} className={tab === item.id ? "active" : ""} onClick={() => { setTab(item.id); setError(null); setNotice(null); }}><strong>{item.label}</strong><small>{item.description}</small></button>)}</nav><button type="button" className="account-logout" disabled={busy} onClick={() => void logout()}>خروج از حساب</button></aside>
            <div className="account-dashboard-content">
              {error && <p className="form-message error" role="alert">{error}</p>}{notice && <p className="form-message success" role="status">{notice}</p>}
              {tab === "overview" && <><div className="account-stat-grid"><button type="button" onClick={() => setTab("orders")}><strong>{dashboard.totalOrders.toLocaleString("fa-IR")}</strong><span>سفارش ثبت‌شده</span></button><button type="button" onClick={() => setTab("addresses")}><strong>{dashboard.addresses.length.toLocaleString("fa-IR")}</strong><span>آدرس ذخیره‌شده</span></button><div><strong>{defaultAddress ? "آماده" : "ناقص"}</strong><span>اطلاعات تحویل سریع</span></div></div><section className="dashboard-card"><div className="dashboard-card-heading"><div><span className="eyebrow">مشخصات شخصی</span><h2>اطلاعات حساب</h2></div><p>ایمیل حساب برای ورود استفاده می‌شود و از این بخش قابل تغییر نیست.</p></div><form className="dashboard-form-grid" onSubmit={submitProfile}><label>نام<input required name="firstName" maxLength={60} autoComplete="given-name" defaultValue={customer.firstName}/></label><label>نام خانوادگی<input required name="lastName" maxLength={80} autoComplete="family-name" defaultValue={customer.lastName}/></label><label>شماره موبایل<input name="phoneNumber" maxLength={20} inputMode="tel" autoComplete="tel" dir="ltr" placeholder="09120000000" defaultValue={customer.phoneNumber ?? ""}/></label><label>ایمیل<input disabled dir="ltr" value={customer.emailAddress} readOnly/></label><button className="button primary" disabled={busy} type="submit">{busy ? "در حال ذخیره…" : "ذخیره تغییرات"}</button></form></section></>}
              {tab === "addresses" && <section className="dashboard-card"><div className="dashboard-card-heading"><div><span className="eyebrow">دفترچه آدرس</span><h2>آدرس‌های تحویل</h2></div>{editingAddress === undefined && <button type="button" className="button primary" onClick={() => setEditingAddress(null)}>افزودن آدرس</button>}</div>{editingAddress !== undefined ? <form className="dashboard-form-grid address-form" onSubmit={submitAddress}><label>نام تحویل‌گیرنده<input required name="fullName" maxLength={100} autoComplete="name" defaultValue={editingAddress?.fullName ?? `${customer.firstName} ${customer.lastName}`.trim()}/></label><label>شماره موبایل<input required name="phoneNumber" maxLength={20} inputMode="tel" autoComplete="tel" dir="ltr" defaultValue={editingAddress?.phoneNumber ?? customer.phoneNumber ?? ""}/></label><label>استان<input required name="province" maxLength={80} autoComplete="address-level1" defaultValue={editingAddress?.province ?? ""}/></label><label>شهر<input required name="city" maxLength={80} autoComplete="address-level2" defaultValue={editingAddress?.city ?? ""}/></label><label className="full">آدرس کامل<textarea required name="streetLine1" maxLength={300} rows={3} autoComplete="street-address" defaultValue={editingAddress?.streetLine1 ?? ""}/></label><label>جزئیات تکمیلی<input name="streetLine2" maxLength={150} placeholder="واحد، طبقه یا توضیح نشانی" defaultValue={editingAddress?.streetLine2 ?? ""}/></label><label>کد پستی<input required name="postalCode" maxLength={20} inputMode="numeric" autoComplete="postal-code" dir="ltr" defaultValue={editingAddress?.postalCode ?? ""}/></label><label className="dashboard-checkbox"><input type="checkbox" name="defaultShippingAddress" defaultChecked={editingAddress?.defaultShippingAddress ?? dashboard.addresses.length === 0}/><span>آدرس پیش‌فرض برای تکمیل خودکار خرید</span></label><div className="dashboard-form-actions"><button className="button primary" disabled={busy} type="submit">{busy ? "در حال ذخیره…" : "ذخیره آدرس"}</button><button className="button subtle" type="button" onClick={() => setEditingAddress(undefined)}>انصراف</button></div></form> : dashboard.addresses.length ? <div className="address-grid">{dashboard.addresses.map((address) => <article className="address-card" key={address.id}><div>{address.defaultShippingAddress && <span className="address-default">پیش‌فرض</span>}<h3>{address.fullName || "آدرس تحویل"}</h3><p>{addressLabel(address)}</p><small>کد پستی: <span dir="ltr">{address.postalCode}</span> · <span dir="ltr">{address.phoneNumber}</span></small></div><div><button type="button" onClick={() => setEditingAddress(address)}>ویرایش</button><button type="button" className="danger" disabled={busy} onClick={() => void deleteAddress(address)}>حذف</button></div></article>)}</div> : <div className="account-empty"><h3>هنوز آدرسی ذخیره نکرده‌ای.</h3><p>با ذخیره آدرس، فرم تسویه‌حساب دفعه بعد خودکار پر می‌شود.</p><button type="button" className="button primary" onClick={() => setEditingAddress(null)}>ذخیره اولین آدرس</button></div>}</section>}
              {tab === "orders" && <section className="dashboard-card"><div className="dashboard-card-heading"><div><span className="eyebrow">تاریخچه خرید</span><h2>سفارش‌های من</h2></div><p>{dashboard.totalOrders.toLocaleString("fa-IR")} سفارش</p></div>{dashboard.orders.length ? <div className="order-history">{dashboard.orders.map((order) => <details className="account-order" key={order.id}><summary><span><small>شماره سفارش</small><strong dir="ltr">{order.code}</strong></span><span><small>تاریخ</small><strong>{order.orderPlacedAt ? new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(new Date(order.orderPlacedAt)) : "—"}</strong></span><span><small>وضعیت</small><strong className="order-state">{orderStates[order.state] ?? order.state}</strong></span><span><small>مبلغ</small><strong>{formatPrice(order.total)} تومان</strong></span></summary><div className="account-order-lines">{order.lines.map((line) => <Link href={`/product/${line.productSlug}`} key={line.id}><span><strong>{line.productName}</strong><small>{line.variantName} · {line.quantity.toLocaleString("fa-IR")} عدد</small></span><b>مشاهده محصول</b></Link>)}</div></details>)}</div> : <div className="account-empty"><h3>هنوز سفارشی ثبت نکرده‌ای.</h3><p>بعد از اولین خرید، وضعیت و جزئیات آن اینجا نمایش داده می‌شود.</p><Link className="button primary" href="/shop">شروع خرید</Link></div>}</section>}
              {tab === "security" && <section className="dashboard-card security-card"><div className="dashboard-card-heading"><div><span className="eyebrow">امنیت حساب</span><h2>تغییر رمز عبور</h2></div><ShieldIcon/></div><p>برای امنیت بیشتر، رمز جدید را در هیچ حساب دیگری استفاده نکن.</p><form className="dashboard-form-grid" onSubmit={submitPassword}><label className="full">رمز عبور فعلی<input required name="currentPassword" type="password" minLength={8} maxLength={72} autoComplete="current-password" dir="ltr"/></label><label>رمز عبور جدید<input required name="newPassword" type="password" minLength={8} maxLength={72} autoComplete="new-password" dir="ltr"/></label><label>تکرار رمز جدید<input required name="confirmPassword" type="password" minLength={8} maxLength={72} autoComplete="new-password" dir="ltr"/></label><button className="button primary" disabled={busy} type="submit">{busy ? "در حال تغییر…" : "تغییر رمز عبور"}</button></form></section>}
            </div>
          </div>
        </section>
      </main>
    );
  }

  return <main className="account-page"><section className="account-shell"><div className="account-intro"><span className="eyebrow">حساب دانیا</span><h1>همه‌چیز برای<br/>قدم بعدی.</h1><p>سفارش‌ها و اطلاعات خریدت در یک جای امن می‌مانند.</p><div className="account-security"><ShieldIcon/><span><strong>ورود امن</strong>نشست حساب فقط در کوکی محافظت‌شده نگهداری می‌شود.</span></div></div><div className="account-panel"><div className="account-tabs" role="tablist" aria-label="ورود یا عضویت"><button type="button" role="tab" aria-selected={mode === "login"} className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setError(null); }}>ورود</button><button type="button" role="tab" aria-selected={mode === "register"} className={mode === "register" ? "active" : ""} onClick={() => { setMode("register"); setError(null); }}>ساخت حساب</button></div><form className="account-form" onSubmit={submitAuth}>{mode === "register" && <div className="name-fields"><label>نام<input required maxLength={60} autoComplete="given-name" name="firstName"/></label><label>نام خانوادگی<input required maxLength={80} autoComplete="family-name" name="lastName"/></label></div>}<label>ایمیل<input required type="email" maxLength={254} inputMode="email" autoComplete="email" name="emailAddress" dir="ltr"/></label><label>رمز عبور<input required type="password" minLength={8} maxLength={72} autoComplete={mode === "login" ? "current-password" : "new-password"} name="password" dir="ltr"/></label><p className="password-hint">حداقل ۸ کاراکتر</p>{error && <p className="form-message error" role="alert">{error}</p>}{notice && <p className="form-message success" role="status">{notice}</p>}<button className="button primary wide" disabled={busy} type="submit">{busy ? "کمی صبر کنید…" : mode === "login" ? "ورود به حساب" : "ساخت حساب"}</button></form></div></section></main>;
}
