"use client";

import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { ArrowLeftIcon, RefreshIcon, RulerIcon, ShieldIcon, TruckIcon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { GlassHero } from "@/components/glass-hero";
import { ShoeStoryGate } from "@/components/shoe-story-gate";

export function HomePage({ products }: { products: Product[] }) {
  return <main>
    <section className="hero-section"><GlassHero /></section>

    <ShoeStoryGate />

    <section className="categories section">
      <div className="container"><div className="section-heading"><div><span className="eyebrow">دو مسیر، یک استاندارد</span><h2>برای حرکت آزاد</h2></div><Link href="/shop" className="arrow-link">دیدن همه <ArrowLeftIcon /></Link></div>
        <div className="category-grid">
          <Link href="/shop?category=girl" className="category-card girls"><div className="category-shoe product-image bottom-left"/><span>دخترانه</span><strong>رنگ، ریتم، حرکت</strong><i><ArrowLeftIcon /></i></Link>
          <Link href="/shop?category=boy" className="category-card boys"><div className="category-shoe product-image top-right"/><span>پسرانه</span><strong>سبک، محکم، آماده</strong><i><ArrowLeftIcon /></i></Link>
        </div>
      </div>
    </section>

    <section className="featured section"><div className="container"><div className="section-heading"><div><span className="eyebrow">محبوبِ پاهای کوچک</span><h2>بیشتر دوست‌داشتنی‌ها</h2></div><Link href="/shop" className="arrow-link">همه محصولات <ArrowLeftIcon /></Link></div><div className="product-grid">{products.slice(0, 4).map((product) => <ProductCard key={product.id} product={product}/>)}</div></div></section>

    <section className="story-section section"><div className="container story-card"><div className="story-image"><div className="story-photo"/><span className="story-tag">طراحی‌شده برای حرکت آزاد</span></div><div className="story-copy"><span className="eyebrow">فلسفه‌ی دانیا</span><h2>بچه‌ها کفش کوچک نمی‌خواهند؛<br/><em>آزادی بزرگ می‌خواهند.</em></h2><p>ما هر مدل را با پای واقعی بچه‌ها امتحان می‌کنیم. پنجه‌ی جادار، زیره‌ی منعطف و وزن کم؛ همین سه اصل ساده، تمام فرق دانیا را می‌سازد.</p><div className="story-points"><div><strong>۰ تا ۳</strong><span>سال، اولین قدم‌ها</span></div><div><strong>۷ روز</strong><span>فرصت تعویض سایز</span></div><div><strong>۱۰۰٪</strong><span>مواد سازگار با پوست</span></div></div><Link href="/about" className="button dark">داستان ما <ArrowLeftIcon /></Link></div></div></section>

    <section className="service-strip"><div className="container services"><div><TruckIcon/><span><strong>ارسال سریع</strong>تهران ۱ تا ۲ روز کاری</span></div><div><RefreshIcon/><span><strong>تعویض آسان</strong>تا ۷ روز پس از تحویل</span></div><div><ShieldIcon/><span><strong>پرداخت امن</strong>درگاه رسمی بانکی</span></div><div><RulerIcon/><span><strong>مشاوره سایز</strong>قبل از ثبت سفارش</span></div></div></section>
  </main>;
}
