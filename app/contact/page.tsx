import type { Metadata } from "next";
import { InstagramIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "تماس با ما",
  description: "راه‌های تماس با پشتیبانی فروشگاه کفش کودک دانیا برای سفارش، ارسال و انتخاب سایز.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return <main className="contact-page"><section className="container contact-hero"><div><span className="eyebrow">کنارتان هستیم</span><h1>سؤال داری؟<br/>مستقیم با ما حرف بزن.</h1><p>برای انتخاب سایز، پیگیری سفارش یا هر سؤال دیگری، تیم دانیا پاسخ می‌دهد.</p></div><div className="contact-list"><a href="mailto:hello@dania.ir"><span>ایمیل</span><strong dir="ltr">hello@dania.ir</strong><small>پاسخ در کمتر از یک روز کاری</small></a><a href="https://instagram.com/dania.kids" target="_blank" rel="noreferrer"><span>اینستاگرام</span><strong><InstagramIcon/> @dania.kids</strong><small>پیام مستقیم برای راهنمایی سریع</small></a><div><span>ساعات پاسخگویی</span><strong>شنبه تا پنجشنبه، ۹ تا ۱۸</strong><small>به‌جز تعطیلات رسمی</small></div></div></section><section className="contact-note"><div className="container"><span>قبل از تماس</span><h2>شماره سفارش و سایز فعلی را آماده داشته باش؛ سریع‌تر راهنمایی‌ات می‌کنیم.</h2></div></section></main>;
}
