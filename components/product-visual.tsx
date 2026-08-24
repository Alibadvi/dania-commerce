"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import type { Product } from "@/lib/catalog";

const FALLBACK_POSITION: Record<Product["imagePosition"], string> = {
  "top-left": "0% 0%",
  "top-right": "100% 0%",
  "bottom-left": "0% 100%",
  "bottom-right": "100% 100%",
};

type ProductVisualProps = {
  product: Product;
  className?: string;
  imageClassName?: string;
  style?: CSSProperties;
  alt?: string;
};

export function ProductVisual({
  product,
  className = "",
  imageClassName = "",
  style,
  alt,
}: ProductVisualProps) {
  const source = product.imageUrl?.trim() || "";
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [source]);

  const showRealImage = Boolean(source) && !failed;

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={style}
      role="img"
      aria-label={alt ?? product.name}
    >
      {showRealImage ? (
        <img
          src={source}
          alt=""
          draggable={false}
          onError={() => setFailed(true)}
          className={`absolute inset-0 h-full w-full select-none object-contain ${imageClassName}`}
        />
      ) : (
        <span
          className={`absolute inset-0 block ${imageClassName}`}
          style={{
            backgroundImage: 'url("/images/danya-catalog-grid.webp")',
            backgroundPosition: FALLBACK_POSITION[product.imagePosition],
            backgroundRepeat: "no-repeat",
            backgroundSize: "200% 200%",
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}