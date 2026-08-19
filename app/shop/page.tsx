import type { Metadata } from "next";
import { CatalogPage } from "@/components/catalog-page";

export const metadata: Metadata = { title: "فروشگاه" };

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const params = await searchParams;
  return <CatalogPage initialCategory={params.category ?? "all"}/>;
}
