"use client";

import type { Product } from "@/lib/catalog";
import { GlassHero } from "@/components/glass-hero";
import { DaniaMotionPath } from "@/components/dania-motion-path";
import { FeaturedProductRail } from "@/components/featured-product-rail";
import { DaniaStandard } from "@/components/dania-standard";

export function HomePage({ products }: { products: Product[] }) {
  return (
    <main>
      <section className="hero-section">
        <GlassHero />
      </section>

      <DaniaMotionPath />
      <FeaturedProductRail products={products} />
      <DaniaStandard />
    </main>
  );
}