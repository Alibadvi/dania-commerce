"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowLeftIcon } from "@/components/icons";

export function CollectionPortals() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const titleY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [90, -120]);
  const girlY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [70, -42]);
  const boyY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [128, -72]);

  return (
    <section ref={sectionRef} className="collection-portals" aria-labelledby="collection-portals-title">
      <motion.span className="collection-portals-ghost" style={{ y: titleY }} aria-hidden="true">NEXT MOVE</motion.span>
      <div className="container collection-portals-inner">
        <header className="collection-portals-head">
          <span>CHOOSE YOUR MOVE / 02</span>
          <h2 id="collection-portals-title">کدوم مسیر؟</h2>
        </header>
        <div className="collection-portals-grid">
          <motion.div className="collection-portal-wrap" style={{ y: girlY }}>
            <Link href="/shop?category=girl" className="collection-portal collection-portal--girl">
              <span className="collection-portal-index">01 / GIRLS</span>
              <span className="collection-portal-word" aria-hidden="true">GIRLS</span>
              <span className="collection-portal-shoe product-image bottom-left" aria-hidden="true" />
              <span className="collection-portal-label"><b>دخترانه</b><i><ArrowLeftIcon /></i></span>
            </Link>
          </motion.div>
          <motion.div className="collection-portal-wrap collection-portal-wrap--boy" style={{ y: boyY }}>
            <Link href="/shop?category=boy" className="collection-portal collection-portal--boy">
              <span className="collection-portal-index">02 / BOYS</span>
              <span className="collection-portal-word" aria-hidden="true">BOYS</span>
              <span className="collection-portal-shoe product-image top-right" aria-hidden="true" />
              <span className="collection-portal-label"><b>پسرانه</b><i><ArrowLeftIcon /></i></span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
