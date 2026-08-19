"use client";

import Link from "next/link";
import { products } from "@/lib/catalog";
import { ArrowLeftIcon, RefreshIcon, RulerIcon, ShieldIcon, TruckIcon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";

export function HomePage() {
  return <main>
    <section className="hero-section">
      <div className="container hero-card">
        <div className="hero-art" role="img" aria-label="کتانی کودک مرجانی روی استندهای رنگی" />
        <div className="hero-copy">
          <span className="pill-label"><i /> کالکشن تازه رسید</span>
          <h1>هر قدم،<br/><em>یک ماجراست.</em></h1>
          <p>کفش‌هایی نرم، سبک و بادوام برای بچه‌هایی که هیچ‌وقت از کشف‌کردن خسته نمی‌شوند.</p>
          <div className="hero-actions"><Link href="/shop" className="button primary">خرید کالکشن جدید <ArrowLeftIcon /></Link><a href="#size-guide" className="text-link">راهنمای انتخاب سایز</a></div>
        </div>
        <div className="hero-sticker"><strong>۱۰۰٪</strong><span>راحتی<br/>تضمینی</span></div>
        <div className="hero-doodle doodle-one">✦</div><div className="hero-doodle doodle-two">●</div>
      </div>
    </section>

    <section className="categories section">
      <div className="container"><div className="section-heading"><div><span className="eyebrow">برای هر سن و هر سبک</span><h2>کدام ماجراجو؟</h2></div><Link href="/shop" className="arrow-link">دیدن همه <ArrowLeftIcon /></Link></div>
        <div className="category-grid">
          <Link href="/shop?category=girl" className="category-card coral"><div className="category-shoe product-image bottom-left"/><span>دخترانه</span><strong>رنگی و پرانرژی</strong><i><ArrowLeftIcon /></i></Link>
          <Link href="/shop?category=boy" className="category-card blue"><div className="category-shoe product-image top-right"/><span>پسرانه</span><strong>محکم برای بازی</strong><i><ArrowLeftIcon /></i></Link>
          <Link href="/shop?category=baby" className="category-card yellow"><div className="category-shoe product-image top-left"/><span>اولین قدم</span><strong>نرم مثل آغوش</strong><i><ArrowLeftIcon /></i></Link>
        </div>
      </div>
    </section>

    <section className="featured section"><div className="container"><div className="section-heading"><div><span className="eyebrow">محبوبِ پاهای کوچک</span><h2>بیشتر دوست‌داشتنی‌ها</h2></div><Link href="/shop" className="arrow-link">همه محصولات <ArrowLeftIcon /></Link></div><div className="product-grid">{products.slice(0, 4).map((product) => <ProductCard key={product.id} product={product}/>)}</div></div></section>

    <section className="story-section section"><div className="container story-card"><div className="story-image"><div className="story-photo"/><span className="story-tag">طراحی‌شده برای حرکت آزاد</span></div><div className="story-copy"><span className="eyebrow">فلسفه‌ی دانیا</span><h2>بچه‌ها کفش کوچک نمی‌خواهند؛<br/><em>آزادی بزرگ می‌خواهند.</em></h2><p>ما هر مدل را با پای واقعی بچه‌ها امتحان می‌کنیم. پنجه‌ی جادار، زیره‌ی منعطف و وزن کم؛ همین سه اصل ساده، تمام فرق دانیا را می‌سازد.</p><div className="story-points"><div><strong>۰ تا ۳</strong><span>سال، اولین قدم‌ها</span></div><div><strong>۷ روز</strong><span>فرصت تعویض سایز</span></div><div><strong>۱۰۰٪</strong><span>مواد سازگار با پوست</span></div></div><Link href="/about" className="button dark">داستان ما <ArrowLeftIcon /></Link></div></div></section>

    <section className="size-section section" id="size-guide"><div className="container size-card"><div className="size-steps"><span className="eyebrow">سایز درست، خیلی ساده</span><h2>پا را اندازه بگیر؛<br/>بقیه‌اش با ما.</h2><p>فقط یک کاغذ، یک مداد و دو دقیقه وقت لازم داری.</p><div className="steps"><div><b>۱</b><span>پاشنه را کنار دیوار روی کاغذ بگذار.</span></div><div><b>۲</b><span>جلوی بلندترین انگشت را علامت بزن.</span></div><div><b>۳</b><span>سانتی‌متر را در جدول سایز پیدا کن.</span></div></div><button className="button cream">باز کردن جدول سایز <RulerIcon /></button></div><div className="size-visual"><div className="footprint">◖</div><div className="measure-line"><span>طول پا</span><i/></div><span className="size-bubble">اندازه‌گیری<br/>در ۲ دقیقه</span></div></div></section>

    <section className="service-strip"><div className="container services"><div><TruckIcon/><span><strong>ارسال سریع</strong>تهران ۱ تا ۲ روز کاری</span></div><div><RefreshIcon/><span><strong>تعویض آسان</strong>تا ۷ روز پس از تحویل</span></div><div><ShieldIcon/><span><strong>پرداخت امن</strong>درگاه رسمی بانکی</span></div><div><RulerIcon/><span><strong>مشاوره سایز</strong>قبل از ثبت سفارش</span></div></div></section>
  </main>;
}
