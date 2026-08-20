import { presentationForSlug, products as fallbackProducts, type Product, type ProductCategory } from "@/lib/catalog";

type VendureVariant = {
  id: string;
  name: string;
  priceWithTax: number;
  currencyCode: string;
  stockLevel: string;
  options: Array<{ code: string; name: string }>;
};

type VendureProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  featuredAsset?: { preview: string } | null;
  facetValues: Array<{ code: string; name: string; facet: { code: string } }>;
  variants: VendureVariant[];
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

const PRODUCTS_QUERY = `query DanyaProducts {
  products(options: { take: 100, sort: { name: ASC } }) {
    items {
      id name slug description
      featuredAsset { preview }
      facetValues { code name facet { code } }
      variants { id name priceWithTax currencyCode stockLevel options { code name } }
    }
  }
}`;

const PRODUCT_QUERY = `query DanyaProduct($slug: String!) {
  product(slug: $slug) {
    id name slug description
    featuredAsset { preview }
    facetValues { code name facet { code } }
    variants { id name priceWithTax currencyCode stockLevel options { code name } }
  }
}`;

function shopApiUrl(): string | undefined {
  const value = process.env.VENDURE_SHOP_API_URL?.trim();
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

async function storefrontRequest<T>(query: string, variables: Record<string, unknown> = {}): Promise<T | null> {
  const endpoint = shopApiUrl();
  if (!endpoint) return null;
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json", "x-vendure-language-code": "fa" },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
      signal: AbortSignal.timeout(4_000),
    });
    if (!response.ok) return null;
    const payload = await response.json() as GraphQLResponse<T>;
    if (payload.errors?.length) return null;
    return payload.data ?? null;
  } catch {
    return null;
  }
}

function asCategory(product: VendureProduct, fallback?: Product): ProductCategory {
  const facet = product.facetValues.find((item) => item.facet.code === "category");
  if (facet?.name === "دخترانه" || facet?.name === "پسرانه" || facet?.name === "نوزادی") return facet.name;
  return fallback?.category ?? "نوزادی";
}

function sizeFromVariant(variant: VendureVariant, index: number): number {
  const option = variant.options.find((item) => item.code.startsWith("size-") || /^\d+$/.test(item.name));
  const parsed = Number(option?.name ?? option?.code.replace(/^size-/, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : index + 1;
}

export function rialToToman(value: number): number {
  return Math.round(value / 10);
}

function mapProduct(product: VendureProduct, index = 0): Product {
  const presentation = presentationForSlug(product.slug) ?? fallbackProducts[index % fallbackProducts.length];
  const variants = product.variants
    .map((variant, variantIndex) => ({
      id: variant.id,
      name: variant.name,
      size: sizeFromVariant(variant, variantIndex),
      price: rialToToman(variant.priceWithTax),
      stockLevel: variant.stockLevel,
    }))
    .sort((left, right) => left.size - right.size);
  const availableVariants = variants.filter((variant) => variant.stockLevel !== "OUT_OF_STOCK");
  const firstVariant = availableVariants[0] ?? variants[0];

  return {
    ...presentation,
    id: product.id,
    slug: product.slug,
    name: product.name,
    subtitle: presentation?.subtitle ?? product.description.split(/[.!؟]/)[0],
    description: product.description || presentation?.description || "",
    category: asCategory(product, presentation),
    price: firstVariant?.price ?? presentation?.price ?? 0,
    sizes: availableVariants.map((variant) => variant.size),
    variants: availableVariants,
    imageUrl: product.featuredAsset?.preview ?? presentation?.imageUrl,
  };
}

export async function fetchVendureProducts(): Promise<Product[]> {
  const data = await storefrontRequest<{ products: { items: VendureProduct[] } }>(PRODUCTS_QUERY);
  const items = data?.products.items ?? [];
  return items.length ? items.map(mapProduct) : fallbackProducts;
}

export async function fetchVendureProduct(slug: string): Promise<Product | undefined> {
  const safeSlug = slug.trim().slice(0, 128);
  const data = await storefrontRequest<{ product: VendureProduct | null }>(PRODUCT_QUERY, { slug: safeSlug });
  if (data?.product) return mapProduct(data.product);
  return fallbackProducts.find((product) => product.slug === safeSlug);
}

export function isFallbackCatalog(catalog: Product[]): boolean {
  return catalog.some((product) => product.variants.some((variant) => variant.id.startsWith("demo-")));
}
