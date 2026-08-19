import Link from "next/link";
import { ArrowLeftIcon, LeafIcon, RulerIcon, ShieldIcon, SparkIcon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { products } from "@/lib/catalog";

export default function HomePage() {
  return (
    <main>
      <section className="hero shell" aria-labelledby="hero-title">
        <div className="hero-copy reveal">
          <p className="eyebrow"><span /> خانواده‌ی دانیا، برای قدم‌های کوچک</p>
          <h1 id="hero-title">کفش‌هایی برای<br /><em>رویشِ هر قدم</em></h1>
          <p className="hero-lede">
            انتخابی نرم، امن و سرشار از رنگ برای کودکانی که هر روز جهانشان را
            کمی بزرگ‌تر می‌کنند.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/shop">
              مشاهده‌ی کالکشن <ArrowLeftIcon />
            </Link>
            <Link className="text-link" href="#story">قصه‌ی دانیا <span>←</span></Link>
          </div>
          <div className="hero-proof" aria-label="مزیت‌های دانیا">
            <span><ShieldIcon /> ضمانت اصالت</span>
            <span><RulerIcon /> راهنمای دقیق سایز</span>
          </div>
        </div>

        <div className="hero-visual reveal reveal-late">
          <div className="hero-image-wrap">
            <img src="/images/dania-hero.webp" alt="کفش‌های کودکانه رنگی دانیا" />
            <span className="hero-orbit orbit-one">نرم</span>
            <span className="hero-orbit orbit-two">سبک</span>
          </div>
          <div className="hero-note">
            <span className="hero-note-number">۰۱</span>
            <p>ساخته‌شده برای بازی، دویدن و کشف کردن</p>
          </div>
        </div>
      </section>

      <section className="ticker" aria-label="ویژگی‌های برند">
        <div>
          <span>ارسال به سراسر ایران</span><i>✦</i>
          <span>تعویض آسان سایز</span><i>✦</i>
          <span>انتخاب راحت برای والدین</span><i>✦</i>
          <span>طراحی برای پای در حال رشد</span><i>✦</i>
          <span>ارسال به سراسر ایران</span><i>✦</i>
        </div>
      </section>

      <section className="category-section shell section-space">
        <div className="section-heading">
          <div>
            <p className="eyebrow"><span /> از کجا شروع کنیم؟</p>
            <h2>برای هر ماجراجویی،<br />یک جفت دانیا</h2>
          </div>
          <p>مدل مناسب کودک شما را با توجه به سبک زندگی و بازی‌های روزانه‌اش پیدا کنید.</p>
        </div>
        <div className="category-grid">
          <Link className="category-card category-card-large peach-card" href="/shop?category=everyday">
            <span className="category-count">۱۲ مدل</span>
            <div className="category-art category-art-everyday"><span /><span /><span /></div>
            <div><p>راحت و همه‌کاره</p><h3>هر روزه</h3><span className="circle-arrow"><ArrowLeftIcon /></span></div>
          </Link>
          <Link className="category-card blue-card" href="/shop?category=play">
            <span className="category-count">۸ مدل</span>
            <div className="category-art category-art-play"><span /><span /></div>
            <div><p>سبک و انعطاف‌پذیر</p><h3>بازی و حرکت</h3><span className="circle-arrow"><ArrowLeftIcon /></span></div>
          </Link>
          <Link className="category-card pink-card" href="/shop?category=party">
            <span className="category-count">۶ مدل</span>
            <div className="category-art category-art-party"><span /><span /></div>
            <div><p>خاص و درخشان</p><h3>مهمانی</h3><span className="circle-arrow"><ArrowLeftIcon /></span></div>
          </Link>
        </div>
      </section>

      <section className="products-section section-space">
        <div className="shell">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow"><span /> تازه رسیده‌ها</p>
              <h2>محبوبِ قدم‌های کوچک</h2>
            </div>
            <Link className="text-link" href="/shop">دیدن همه محصولات <span>←</span></Link>
          </div>
          <div className="product-grid">
            {products.slice(0, 4).map((product, index) => (
              <ProductCard key={product.slug} product={product} priority={index < 2} />
            ))}
          </div>
        </div>
      </section>

      <section className="story shell section-space" id="story">
        <div className="story-image">
          <img src="/images/dania-editorial.webp" alt="کفش‌های دانیا روی فرم‌های رنگی بازی" />
          <span className="story-stamp"><LeafIcon /><b>هر دانه،<br />یک جهان</b></span>
        </div>
        <div className="story-copy">
          <p className="eyebrow"><span /> خانواده‌ی دانیا</p>
          <h2>ما فقط کفش نمی‌فروشیم؛<br /><em>مراقبِ رویشیم.</em></h2>
          <p>
            «دانیا» از دانه می‌آید؛ از این باور که هر کودک، دانه‌ای ارزشمند است و
            اگر با عشق و آگاهی پرورش پیدا کند، می‌تواند جهانی را رشد دهد.
          </p>
          <blockquote>
            <SparkIcon />
            <div><strong>قانون ۷۰</strong><span>هر دانه‌ی خوب‌پرورش‌یافته، توان ساختن هفتاد دانه‌ی تازه را دارد.</span></div>
          </blockquote>
          <Link className="button button-secondary" href="/about">قصه‌ی کامل ما <ArrowLeftIcon /></Link>
        </div>
      </section>

      <section className="fit-banner">
        <div className="shell fit-inner">
          <div className="fit-icon"><RulerIcon /></div>
          <div><p>سایز مناسب، حال خوبِ پا</p><h2>در کمتر از یک دقیقه، سایز دقیق کودک را پیدا کنید.</h2></div>
          <Link className="button button-cream" href="/size-guide">راهنمای اندازه‌گیری <ArrowLeftIcon /></Link>
        </div>
      </section>

      <section className="newsletter shell section-space">
        <div>
          <p className="eyebrow"><span /> نامه‌های خانواده دانیا</p>
          <h2>از قصه‌ها، تازه‌ها و<br />تخفیف‌های کوچک باخبر شوید.</h2>
        </div>
        <form className="newsletter-form">
          <label htmlFor="mobile">شماره موبایل شما</label>
          <div><input id="mobile" inputMode="tel" placeholder="۰۹۱۲ ۱۲۳ ۴۵۶۷" /><button type="submit" aria-label="عضویت"><ArrowLeftIcon /></button></div>
          <small>با عضویت، قوانین حفظ حریم خصوصی دانیا را می‌پذیرید.</small>
        </form>
      </section>
    </main>
  );
}
