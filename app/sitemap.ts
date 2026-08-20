import type { MetadataRoute } from "next";
import { fetchVendureProducts } from "@/lib/vendure";
import { absoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const products = await fetchVendureProducts();
  return [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/shop"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/contact"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    ...products.map((product) => ({ url: absoluteUrl(`/product/${product.slug}`), lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
