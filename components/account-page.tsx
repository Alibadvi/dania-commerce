"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { CustomerAccount } from "@/lib/commerce-types";
import { ShieldIcon, UserIcon } from "@/components/icons";

type AccountResponse = {
  customer?: CustomerAccount | null;
  registered?: boolean;
  error?: { message?: string };
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

export function AccountPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [customer, setCustomer] = useState<CustomerAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    accountRequest()
      .then((payload) => { if (!cancelled) setCustomer(payload.customer ?? null); })
      .catch(() => { /* The form remains useful when the local commerce service starts. */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setBusy(true);
    setError(null);
    setNotice(null);
    const form = new FormData(formElement);
    try {
      if (mode === "login") {
        const payload = await accountRequest({
          action: "auth.login",
          credentials: { emailAddress: form.get("emailAddress"), password: form.get("password") },
        });
        setCustomer(payload.customer ?? null);
      } else {
        await accountRequest({
          action: "auth.register",
          customer: {
            firstName: form.get("firstName"),
            lastName: form.get("lastName"),
            emailAddress: form.get("emailAddress"),
            password: form.get("password"),
          },
        });
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

  async function logout() {
    setBusy(true);
    setError(null);
    try {
      await accountRequest({ action: "auth.logout" });
      setCustomer(null);
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : "خروج انجام نشد.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <main className="account-page"><div className="account-loading">در حال بررسی حساب…</div></main>;

  if (customer) {
    return <main className="account-page"><section className="account-shell account-dashboard"><div className="account-mark"><UserIcon /></div><span className="eyebrow">حساب دانیا</span><h1>{customer.firstName} {customer.lastName}</h1><p>{customer.emailAddress}</p><div className="account-actions"><Link className="button dark" href="/shop">ادامه خرید</Link><button className="button subtle" disabled={busy} onClick={() => void logout()}>خروج از حساب</button></div>{error && <p className="form-message error" role="alert">{error}</p>}</section></main>;
  }

  return (
    <main className="account-page">
      <section className="account-shell">
        <div className="account-intro">
          <span className="eyebrow">حساب دانیا</span>
          <h1>همه‌چیز برای<br/>قدم بعدی.</h1>
          <p>سفارش‌ها و اطلاعات خریدت در یک جای امن می‌مانند.</p>
          <div className="account-security"><ShieldIcon/><span><strong>ورود امن</strong>نشست حساب فقط در کوکی محافظت‌شده نگهداری می‌شود.</span></div>
        </div>
        <div className="account-panel">
          <div className="account-tabs" role="tablist" aria-label="ورود یا عضویت">
            <button role="tab" aria-selected={mode === "login"} className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setError(null); }}>ورود</button>
            <button role="tab" aria-selected={mode === "register"} className={mode === "register" ? "active" : ""} onClick={() => { setMode("register"); setError(null); }}>ساخت حساب</button>
          </div>
          <form className="account-form" onSubmit={submit}>
            {mode === "register" && <div className="name-fields"><label>نام<input required maxLength={60} autoComplete="given-name" name="firstName" /></label><label>نام خانوادگی<input required maxLength={80} autoComplete="family-name" name="lastName" /></label></div>}
            <label>ایمیل<input required type="email" maxLength={254} inputMode="email" autoComplete="email" name="emailAddress" dir="ltr" /></label>
            <label>رمز عبور<input required type="password" minLength={8} maxLength={72} autoComplete={mode === "login" ? "current-password" : "new-password"} name="password" dir="ltr" /></label>
            <p className="password-hint">حداقل ۸ کاراکتر</p>
            {error && <p className="form-message error" role="alert">{error}</p>}
            {notice && <p className="form-message success" role="status">{notice}</p>}
            <button className="button primary wide" disabled={busy} type="submit">{busy ? "کمی صبر کنید…" : mode === "login" ? "ورود به حساب" : "ساخت حساب"}</button>
          </form>
        </div>
      </section>
    </main>
  );
}
