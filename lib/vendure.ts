import { products as demoProducts, type Product } from "@/lib/catalog";

type VendureProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  featuredAsset?: { preview: string } | null;
  variants: Array<{ id: string; name: string; priceWithTax: number; currencyCode: string }>;
};

const PRODUCTS_QUERY = `query DanyaProducts {
  products(options: { take: 24 }) {
    items { id name slug description featuredAsset { preview } variants { id name priceWithTax currencyCode } }
  }
}`;

export async function fetchVendureProducts(): Promise<VendureProduct[]> {
  const endpoint = process.env.VENDURE_SHOP_API_URL;
  if (!endpoint) return [];
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: PRODUCTS_QUERY }),
      next: { revalidate: 60 },
    });
    if (!response.ok) return [];
    const payload = await response.json() as { data?: { products?: { items?: VendureProduct[] } } };
    return payload.data?.products?.items ?? [];
  } catch {
    return [];
  }
}

export function getDemoCatalog(): Product[] { return demoProducts; }
