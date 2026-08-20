import type { Metadata } from "next";
import { CatalogPage } from "@/components/catalog-page";
import { fetchVendureProducts } from "@/lib/vendure";

export const metadata: Metadata = {
  title: "فروشگاه کفش کودک",
  description: "خرید آنلاین کفش کودک دخترانه و پسرانه دانیا با انتخاب سایز و امکان تعویض.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const params = await searchParams;
  return <CatalogPage products={await fetchVendureProducts()} initialCategory={params.category ?? "all"}/>;
}
