"use client";

import { FormEvent, useState } from "react";
import { ArrowLeftIcon, ShieldIcon } from "@/components/icons";

export default function AccountPage() {
  const [sent, setSent] = useState(false);
  function submit(event: FormEvent) { event.preventDefault(); setSent(true); }
  return <main className="account-page"><section className="account-panel"><div className="brand-big"><b>DANIA</b><span>دانیا</span></div><p className="eyebrow"><span /> خوش آمدید</p><h1>به خانواده‌ی دانیا<br />برگردید.</h1><p>سفارش‌ها، آدرس‌ها و علاقه‌مندی‌هایتان همیشه همین‌جا هستند.</p><form onSubmit={submit}>{!sent ? <><label><span>شماره موبایل</span><input required inputMode="tel" placeholder="۰۹۱۲ ۱۲۳ ۴۵۶۷" /></label><button className="button button-primary">دریافت کد ورود <ArrowLeftIcon /></button></> : <><label><span>کد ۵ رقمی</span><input required inputMode="numeric" maxLength={5} autoFocus placeholder="— — — — —" /></label><button className="button button-primary">ورود به حساب <ArrowLeftIcon /></button><button type="button" className="text-link" onClick={() => setSent(false)}>اصلاح شماره موبایل</button></>}<small><ShieldIcon /> ورود امن و بدون نیاز به رمز عبور</small></form></section><aside className="account-art"><img src="/images/dania-editorial.webp" alt="کفش‌های کودکانه دانیا" /><blockquote>«هر قدم کوچک،<br />آغاز یک قصه‌ی بزرگ است.»</blockquote></aside></main>;
}
