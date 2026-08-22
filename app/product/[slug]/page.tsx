import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { products } from "@/lib/catalog";
import { fetchVendureProduct } from "@/lib/vendure";
import { absoluteUrl } from "@/lib/site";
import { JsonLd } from "@/components/json-ld";
import { ProductDetail } from "@/components/product-detail";

export function generateStaticParams() { return products.map((product) => ({ slug: product.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchVendureProduct(slug);
  if (!product) return { title: "محصول پیدا نشد" };
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      type: "website",
      locale: "fa_IR",
      title: product.name,
      description: product.description,
      url: `/product/${product.slug}`,
      images: [{ url: product.imageUrl ?? "/images/danya-catalog-grid.webp", width: 1254, height: 1254, alt: product.name }],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await fetchVendureProduct(slug);
  if (!product) notFound();
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: [product.imageUrl ?? absoluteUrl("/images/danya-catalog-grid.webp")],
    sku: product.slug,
    category: `کفش کودک ${product.category}`,
    brand: { "@type": "Brand", name: "دانیا" },
    offers: product.variants.map((variant) => ({
      "@type": "Offer",
      sku: `${product.slug}-${variant.size}`,
      url: absoluteUrl(`/product/${product.slug}`),
      priceCurrency: "IRR",
      price: String(variant.price * 10),
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    })),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "خانه", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "فروشگاه", item: absoluteUrl("/shop") },
      { "@type": "ListItem", position: 3, name: product.name, item: absoluteUrl(`/product/${product.slug}`) },
    ],
  };
  return <><JsonLd data={[productJsonLd, breadcrumbJsonLd]} /><ProductDetail product={product}/></>;
}
