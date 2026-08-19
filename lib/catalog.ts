export type Product = {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  category: "دخترانه" | "پسرانه" | "نوزادی";
  price: number;
  oldPrice?: number;
  sizes: number[];
  color: string;
  badge?: string;
  imagePosition: "top-right" | "top-left" | "bottom-right" | "bottom-left";
};

export const products: Product[] = [
  { id: "1", slug: "roshan-blue", name: "روشن آبی", subtitle: "کتانی سبک روزمره", category: "پسرانه", price: 1890000, sizes: [26, 27, 28, 29, 30, 31], color: "آبی", badge: "جدید", imagePosition: "top-left" },
  { id: "2", slug: "naranj-sunset", name: "نارنج غروب", subtitle: "کتانی نرم و منعطف", category: "دخترانه", price: 2140000, oldPrice: 2390000, sizes: [25, 26, 27, 28, 29], color: "مرجانی", badge: "۱۰٪ تخفیف", imagePosition: "top-right" },
  { id: "3", slug: "sabz-park", name: "سبز پارک", subtitle: "کفش بازی مقاوم", category: "پسرانه", price: 2350000, sizes: [28, 29, 30, 31, 32, 33], color: "سبز", badge: "پرفروش", imagePosition: "bottom-left" },
  { id: "4", slug: "yas-pink", name: "یاس صورتی", subtitle: "کتانی راحت شهری", category: "دخترانه", price: 1980000, sizes: [26, 27, 28, 29, 30], color: "صورتی", imagePosition: "bottom-right" },
  { id: "5", slug: "abr-cream", name: "ابر کرم", subtitle: "کفش اولین قدم", category: "نوزادی", price: 1460000, sizes: [20, 21, 22, 23, 24], color: "کرم", badge: "نرم‌ترین", imagePosition: "top-right" },
  { id: "6", slug: "darya-navy", name: "دریا سرمه‌ای", subtitle: "کتانی مدرسه و روزمره", category: "پسرانه", price: 2250000, sizes: [29, 30, 31, 32, 33, 34], color: "سرمه‌ای", imagePosition: "top-left" },
  { id: "7", slug: "shafagh-lilac", name: "شفق یاسی", subtitle: "کتانی سبک پیاده‌روی", category: "دخترانه", price: 2070000, sizes: [27, 28, 29, 30, 31, 32], color: "یاسی", imagePosition: "bottom-right" },
  { id: "8", slug: "aftab-yellow", name: "آفتاب زرد", subtitle: "کفش بازی تابستانی", category: "نوزادی", price: 1690000, sizes: [21, 22, 23, 24, 25], color: "زرد", imagePosition: "bottom-left" },
];

export const formatPrice = (price: number) => new Intl.NumberFormat("fa-IR").format(price);
export const findProduct = (slug: string) => products.find((product) => product.slug === slug);
