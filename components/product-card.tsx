"use client";

import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { formatToman } from "@/lib/money";
import { useCart } from "./cart-provider";
import { BagIcon, HeartIcon } from "./icons";

export function ProductCard({ product }: { product: Product; priority?: boolean }) {
  const { addItem } = useCart();
  return <article className="product-card">
    <div className="product-media">
      {product.badge && <span className="product-badge">{product.badge}</span>}
      <button className="wish-button" aria-label={`افزودن ${product.name} به علاقه‌مندی‌ها`}><HeartIcon /></button>
      <Link href={`/product/${product.slug}`}><img src={product.image} alt={product.name} /></Link>
      <button className="quick-add" onClick={() => addItem({ slug: product.slug, name: product.name, price: product.price, image: product.image, size: product.sizes[2] })}><BagIcon /> افزودن سریع</button>
    </div>
    <div className="product-meta"><div><Link href={`/product/${product.slug}`}><h3>{product.name}</h3></Link><p>{product.subtitle}</p></div><div className="product-price"><strong>{formatToman(product.price)}</strong>{product.compareAt && <del>{formatToman(product.compareAt)}</del>}</div></div>
  </article>;
}
