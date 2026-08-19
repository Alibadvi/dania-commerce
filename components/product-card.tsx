"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/catalog";
import { formatPrice } from "@/lib/catalog";
import { HeartIcon } from "@/components/icons";
import { useShop } from "@/components/shop-shell";

export function ProductCard({ product }: { product: Product }) {
  const [liked, setLiked] = useState(false);
  const { addToCart } = useShop();
  return <article className="product-card">
    <div className="product-media">
      <Link href={`/product/${product.slug}`} className={`product-image ${product.imagePosition}`} aria-label={product.name} />
      {product.badge && <span className="product-badge">{product.badge}</span>}
      <button className={`heart-button ${liked ? "is-liked" : ""}`} aria-label="افزودن به علاقه‌مندی‌ها" onClick={() => setLiked(!liked)}><HeartIcon /></button>
      <button className="quick-add" onClick={() => addToCart(product.id)}>افزودن سریع</button>
    </div>
    <div className="product-info"><div><Link href={`/product/${product.slug}`}><h3>{product.name}</h3></Link><p>{product.subtitle}</p></div><div className="product-price">{product.oldPrice && <del>{formatPrice(product.oldPrice)}</del>}<strong>{formatPrice(product.price)}</strong><small>تومان</small></div></div>
  </article>;
}
