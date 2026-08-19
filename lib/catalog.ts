export type Product = {
  slug: string;
  name: string;
  subtitle: string;
  price: number;
  compareAt?: number;
  image: string;
  color: string;
  badge?: string;
  sizes: number[];
  category: "everyday" | "play" | "party";
};

export const products: Product[] = [
  { slug: "rooyesh-peach", name: "رویش هلویی", subtitle: "کتانی روزمره سبک", price: 2890000, image: "/images/product-peach.webp", color: "هلویی", badge: "جدید", sizes: [24,25,26,27,28,29,30], category: "everyday" },
  { slug: "darya-blue", name: "دریا آبی", subtitle: "کتانی بازی و حرکت", price: 3150000, image: "/images/product-blue.webp", color: "آبی تیفانی", sizes: [25,26,27,28,29,30,31], category: "play" },
  { slug: "narm-pink", name: "نرم صورتی", subtitle: "کفش راحتی کودک", price: 2670000, compareAt: 2980000, image: "/images/product-pink.webp", color: "صورتی", badge: "۱۰٪", sizes: [23,24,25,26,27,28], category: "everyday" },
  { slug: "jashn-cream", name: "جشن کرم", subtitle: "کتانی نیمه‌رسمی", price: 3390000, image: "/images/product-cream.webp", color: "کرم", badge: "محبوب", sizes: [26,27,28,29,30,31,32], category: "party" },
  { slug: "parvaz-red", name: "پرواز قرمز", subtitle: "کتانی پرانرژی", price: 3060000, image: "/images/product-blue.webp", color: "قرمز", sizes: [25,26,27,28,29,30], category: "play" },
  { slug: "abr-cream", name: "ابر کرمی", subtitle: "کتانی فوق‌سبک", price: 2980000, image: "/images/product-cream.webp", color: "کرم", sizes: [24,25,26,27,28,29], category: "everyday" },
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}
