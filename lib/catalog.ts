export type ProductCategory = "دخترانه" | "پسرانه" | "نوزادی";

export type ProductVariant = {
  id: string;
  name: string;
  size: number;
  price: number;
  stockLevel: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  category: ProductCategory;
  price: number;
  oldPrice?: number;
  sizes: number[];
  variants: ProductVariant[];
  color: string;
  badge?: string;
  imagePosition: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  imageUrl?: string;
};

type ProductSeed = Omit<Product, "variants">;

function defineProduct(product: ProductSeed): Product {
  return {
    ...product,
    variants: product.sizes.map((size) => ({
      id: `demo-${product.slug}-${size}`,
      name: `${product.name} / سایز ${size}`,
      size,
      price: product.price,
      stockLevel: "IN_STOCK",
    })),
  };
}

export const products: Product[] = [
  defineProduct({ id: "1", slug: "roshan-blue", name: "روشن آبی", subtitle: "کتانی سبک روزمره", description: "کتانی سبک با پنجه جادار و کفی قابل تنفس برای بازی‌های طولانی.", category: "پسرانه", price: 1890000, sizes: [26, 27, 28, 29, 30, 31], color: "آبی", badge: "جدید", imagePosition: "top-left" }),
  defineProduct({ id: "2", slug: "naranj-sunset", name: "نارنج غروب", subtitle: "کتانی نرم و منعطف", description: "رویه نرم و زیره منعطف برای حرکت آزاد در تمام طول روز.", category: "دخترانه", price: 2140000, oldPrice: 2390000, sizes: [25, 26, 27, 28, 29], color: "مرجانی", badge: "۱۰٪ تخفیف", imagePosition: "top-right" }),
  defineProduct({ id: "3", slug: "sabz-park", name: "سبز پارک", subtitle: "کفش بازی مقاوم", description: "کفش بازی مقاوم با زیره ضدلغزش و رویه قابل تنفس.", category: "پسرانه", price: 2350000, sizes: [28, 29, 30, 31, 32, 33], color: "سبز", badge: "پرفروش", imagePosition: "bottom-left" }),
  defineProduct({ id: "4", slug: "yas-pink", name: "یاس صورتی", subtitle: "کتانی راحت شهری", description: "کتانی روزمره سبک با پشتی نرم و فرم مناسب پای کودک.", category: "دخترانه", price: 1980000, sizes: [26, 27, 28, 29, 30], color: "صورتی", imagePosition: "bottom-right" }),
  defineProduct({ id: "5", slug: "abr-cream", name: "ابر کرم", subtitle: "کفش اولین قدم", description: "کفش بسیار نرم و سبک برای نخستین قدم‌های مطمئن کودک.", category: "نوزادی", price: 1460000, sizes: [20, 21, 22, 23, 24], color: "کرم", badge: "نرم‌ترین", imagePosition: "top-right" }),
  defineProduct({ id: "6", slug: "darya-navy", name: "دریا سرمه‌ای", subtitle: "کتانی مدرسه و روزمره", description: "کتانی بادوام برای مدرسه و استفاده روزانه با بسته‌شدن آسان.", category: "پسرانه", price: 2250000, sizes: [29, 30, 31, 32, 33, 34], color: "سرمه‌ای", imagePosition: "top-left" }),
  defineProduct({ id: "7", slug: "shafagh-lilac", name: "شفق یاسی", subtitle: "کتانی سبک پیاده‌روی", description: "کتانی سبک و خوش‌رنگ برای پیاده‌روی و بازی روزانه.", category: "دخترانه", price: 2070000, sizes: [27, 28, 29, 30, 31, 32], color: "یاسی", imagePosition: "bottom-right" }),
  defineProduct({ id: "8", slug: "aftab-yellow", name: "آفتاب زرد", subtitle: "کفش بازی تابستانی", description: "کفش خنک تابستانی با زیره نرم برای پاهای کوچک و پرجنب‌وجوش.", category: "نوزادی", price: 1690000, sizes: [21, 22, 23, 24, 25], color: "زرد", imagePosition: "bottom-left" }),
];

export const formatPrice = (price: number) => new Intl.NumberFormat("fa-IR").format(price);
export const findProduct = (slug: string, catalog: Product[] = products) => catalog.find((product) => product.slug === slug);

export function presentationForSlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}
