import { presentationForSlug, products as fallbackProducts, type Product, type ProductCategory } from "@/lib/catalog";
import { vendureShopApiUrl } from "@/lib/commerce-endpoint";

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

const LIVE_CACHE_MS = 60_000;
const FALLBACK_CACHE_MS = 5_000;

type TimedValue<T> = { value: T; expiresAt: number };

let catalogCache: TimedValue<Product[]> | null = null;
const productCache = new Map<string, TimedValue<Product>>();

function fresh<T>(entry: TimedValue<T> | null | undefined): entry is TimedValue<T> {
  return Boolean(entry && entry.expiresAt > Date.now());
}

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

async function storefrontRequest<T>(query: string, variables: Record<string, unknown> = {}): Promise<T | null> {
  const endpoint = vendureShopApiUrl();
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
  const featuredAsset = product.featuredAsset?.preview?.trim();
  const imageUrl = featuredAsset?.includes("danya-catalog-grid")
    ? presentation?.imageUrl
    : featuredAsset ?? presentation?.imageUrl;
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
    imageUrl,
  };
}

export async function fetchVendureProducts(): Promise<Product[]> {
  if (fresh(catalogCache)) return catalogCache.value;

  const data = await storefrontRequest<{ products: { items: VendureProduct[] } }>(PRODUCTS_QUERY);
  const items = data?.products.items ?? [];
  const value = items.length ? items.map(mapProduct) : fallbackProducts;
  const expiresAt = Date.now() + (items.length ? LIVE_CACHE_MS : FALLBACK_CACHE_MS);

  catalogCache = { value, expiresAt };
  value.forEach((product) => productCache.set(product.slug, { value: product, expiresAt }));
  return value;
}

export async function fetchVendureProduct(slug: string): Promise<Product | undefined> {
  const safeSlug = slug.trim().slice(0, 128);
  const cached = productCache.get(safeSlug);
  if (fresh(cached)) return cached.value;

  const data = await storefrontRequest<{ product: VendureProduct | null }>(PRODUCT_QUERY, { slug: safeSlug });
  const value = data?.product
    ? mapProduct(data.product)
    : fallbackProducts.find((product) => product.slug === safeSlug);

  if (value) {
    productCache.set(safeSlug, {
      value,
      expiresAt: Date.now() + (data?.product ? LIVE_CACHE_MS : FALLBACK_CACHE_MS),
    });
  }
  return value;
}

export function isFallbackCatalog(catalog: Product[]): boolean {
  return catalog.some((product) => product.variants.some((variant) => variant.id.startsWith("demo-")));
}
