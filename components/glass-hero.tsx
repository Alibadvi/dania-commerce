"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeftIcon } from "@/components/icons";
import { useIntroReady } from "@/components/intro-context";

export function GlassHero() {
  const ready = useIntroReady();
  const reduceMotion = useReducedMotion();
  const reveal = reduceMotion ? { duration: 0.2 } : { duration: 1.05, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <section className="dania-hero" aria-labelledby="home-hero-title">
      <motion.div
        className="dania-hero-photo"
        role="img"
        aria-label="کتانی مرجانی کودک در دنیایی روشن و رنگی"
        initial={{ y: reduceMotion ? 0 : "34%", scale: reduceMotion ? 1 : 1.08 }}
        animate={ready ? { y: 0, scale: 1 } : { y: reduceMotion ? 0 : "34%", scale: reduceMotion ? 1 : 1.08 }}
        transition={reveal}
      />
      <div className="hero-color-wash" aria-hidden="true" />
      <motion.div
        className="dania-hero-copy"
        initial={{ opacity: 0, y: 38 }}
        animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 38 }}
        transition={{ ...reveal, delay: reduceMotion ? 0 : 0.24 }}
      >
        <span className="hero-kicker"><i /> کالکشن شادِ تازه</span>
        <h1 id="home-hero-title">دنیای کوچک،<br/><em>شادی‌های بزرگ.</em></h1>
        <p>کفش‌های سبک و خوش‌رنگ برای بچه‌هایی که هر روز یک دنیای تازه می‌سازند.</p>
        <div className="dania-hero-actions">
          <Link href="/shop?category=girl" className="button dania-yellow">شروع ماجراجویی <ArrowLeftIcon /></Link>
          <Link href="/shop" className="hero-text-link">دیدن همه کفش‌ها</Link>
        </div>
      </motion.div>
      <motion.div className="hero-play-sticker" initial={{ opacity: 0, rotate: -20, scale: 0.7 }} animate={ready ? { opacity: 1, rotate: -8, scale: 1 } : {}} transition={{ ...reveal, delay: 0.46 }} aria-hidden="true"><span>PLAY</span><strong>BIG!</strong></motion.div>
      <span className="hero-doodle-star" aria-hidden="true">✦</span>
      <span className="hero-scroll-note" aria-hidden="true">اسکرول کن و بچرخان ↓</span>
    </section>
  );
}
