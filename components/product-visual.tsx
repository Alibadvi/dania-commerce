"use client";

import { useState } from "react";
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
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const showRealImage = Boolean(source) && failedSource !== source;

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={style}
      role="img"
      aria-label={alt ?? product.name}
    >
      {showRealImage ? (
        // Product assets may come from the separately-hosted Vendure service, so a
        // plain image avoids coupling the storefront to a second image optimizer.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={source}
          alt=""
          draggable={false}
          onError={() => setFailedSource(source)}
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
