import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon, LeafIcon, SparkIcon } from "@/components/icons";

export const metadata: Metadata = { title: "قصه‌ی دانیا" };

export default function AboutPage() {
  return <main className="page-main about-page"><section className="shell about-hero"><div><p className="eyebrow"><span /> قصه‌ی خانواده‌ی دانیا</p><h1>از یک دانه،<br /><em>تا هزاران رویا</em></h1><p>ما دانیا را ساختیم تا انتخاب خوب برای کودک، ساده‌تر و زیباتر شود؛ چون رشد هر کودک، رشد یک خانواده است.</p></div><div className="about-visual"><img src="/images/dania-hero.webp" alt="کفش‌های کودکانه دانیا" /></div></section><section className="about-law"><div className="shell"><span className="law-number">۷۰</span><div><SparkIcon /><p>قانون ما</p><h2>هر دانه‌ای که درست نگهداری و پرورش داده شود، پتانسیل تبدیل شدن به هفتاد دانه را دارد.</h2></div></div></section><section className="shell values section-space"><p className="eyebrow"><span /> قول ما به خانواده‌ها</p><div className="values-grid"><article><span>۰۱</span><LeafIcon /><h2>رشد سالم</h2><p>محصولی که برای فرم طبیعی پای کودک و آزادی حرکت طراحی شده باشد.</p></article><article><span>۰۲</span><LeafIcon /><h2>انتخاب آگاهانه</h2><p>اطلاعات شفاف، راهنمای دقیق سایز و پشتیبانی انسانی برای هر خرید.</p></article><article><span>۰۳</span><LeafIcon /><h2>خانواده‌ی واقعی</h2><p>رابطه‌ای فراتر از خرید؛ همراهی با خانواده‌ها در مسیر رشد کودکان.</p></article></div><Link className="button button-primary" href="/shop">دیدن کالکشن دانیا <ArrowLeftIcon /></Link></section></main>;
}
