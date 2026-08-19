import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductConfigurator } from "@/components/product-configurator";
import { ProductCard } from "@/components/product-card";
import { ArrowLeftIcon, LeafIcon } from "@/components/icons";
import { formatToman } from "@/lib/money";
import { getProduct, products } from "@/lib/catalog";

export function generateStaticParams() { return products.map((product) => ({ slug: product.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const product = getProduct((await params).slug);
  return { title: product?.name ?? "محصول" };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  return <main className="page-main">
    <div className="shell breadcrumbs"><Link href="/">خانه</Link><span> / </span><Link href="/shop">فروشگاه</Link><span> / </span><b>{product.name}</b></div>
    <section className="shell product-detail">
      <div className="product-gallery">
        <div className="product-main-image"><span className="image-index">۱ / ۳</span>{product.badge && <span className="product-badge">{product.badge}</span>}<img src={product.image} alt={product.name} /></div>
        <div className="product-thumbs"><button className="active"><img src={product.image} alt="نمای اصلی" /></button><button><img src="/images/dania-editorial.webp" alt="نمای سبک زندگی" /></button><button className="detail-texture"><span>جزئیات<br />متریال</span></button></div>
      </div>
      <div className="product-info">
        <p className="eyebrow"><span /> کالکشن هر روزه</p>
        <h1>{product.name}</h1>
        <p className="product-subtitle">{product.subtitle}</p>
        <div className="detail-price"><strong>{formatToman(product.price)}</strong>{product.compareAt && <del>{formatToman(product.compareAt)}</del>}</div>
        <p className="product-description">کتانی نرم و سبک برای ساعت‌ها بازی و حرکت؛ با پنجه‌ی جادار، کفی انعطاف‌پذیر و متریال قابل‌تنفس برای پای در حال رشد.</p>
        <div className="color-choice"><strong>رنگ: {product.color}</strong><span className={`swatch swatch-${product.category}`} /></div>
        <ProductConfigurator product={product} />
        <details open><summary>ویژگی‌ها و نگهداری</summary><ul><li>رویه‌ی تنفس‌پذیر و قابل نظافت</li><li>کفی نرم با قوس مناسب کودک</li><li>زیره‌ی ضدلغزش و منعطف</li></ul></details>
        <details><summary>ارسال و تعویض</summary><p>ارسال به سراسر ایران و امکان تعویض سایز تا ۷ روز پس از تحویل.</p></details>
      </div>
    </section>
    <section className="why-product"><div className="shell"><LeafIcon /><div><p>طراحی‌شده برای پای در حال رشد</p><h2>جا برای رشد، آزادی برای حرکت.</h2></div><Link className="text-link" href="/size-guide">راهنمای انتخاب سایز <ArrowLeftIcon /></Link></div></section>
    <section className="shell related section-space"><div className="section-heading compact"><div><p className="eyebrow"><span /> شاید دوست داشته باشید</p><h2>همراه‌های دیگر</h2></div></div><div className="product-grid">{products.filter((item) => item.slug !== product.slug).slice(0, 4).map((item) => <ProductCard key={item.slug} product={item} />)}</div></section>
  </main>;
}
