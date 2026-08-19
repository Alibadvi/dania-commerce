import { notFound } from "next/navigation";
import { findProduct, products } from "@/lib/catalog";
import { ProductDetail } from "@/components/product-detail";

export function generateStaticParams() { return products.map((product) => ({ slug: product.slug })); }

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = findProduct(slug);
  if (!product) notFound();
  return <ProductDetail product={product}/>;
}
