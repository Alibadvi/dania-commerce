"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeftIcon } from "@/components/icons";
import { useIntroReady } from "@/components/intro-context";

const heroWords = ["PLAY", "DREAM", "RUN", "GROW", "EXPLORE", "SMILE"];

export function GlassHero() {
  const ready = useIntroReady();
  const reduceMotion = useReducedMotion();
  const reveal = reduceMotion ? { duration: 0.2 } : { duration: 1.05, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <section className="dania-hero" aria-labelledby="home-hero-title">
      <motion.div
        className="dania-hero-photo"
        role="img"
        aria-label="کودکی شاد در حال بازی با کفش‌های رنگی دانیا"
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
        <span className="hero-kicker"><i /> کالکشن تازه‌ی دانیا</span>
        <h1 id="home-hero-title">برای قدم‌هایی<br/><em>که آروم نمی‌گیرن.</em></h1>
        <p>کفش‌های سبک، نرم و خوش‌رنگ؛ برای دویدن، کشف کردن و هر بازی تازه.</p>
        <div className="dania-hero-actions">
          <Link href="/shop" className="hero-shop-button">
            <span>همین حالا خرید کن</span>
            <i><ArrowLeftIcon /></i>
          </Link>
        </div>
      </motion.div>
      <motion.div
        className="hero-edition-mark"
        initial={{ opacity: 0, x: reduceMotion ? 0 : -20 }}
        animate={ready ? { opacity: 1, x: 0 } : { opacity: 0, x: reduceMotion ? 0 : -20 }}
        transition={{ ...reveal, delay: reduceMotion ? 0 : 0.4 }}
        aria-hidden="true"
      >
        <small>DANIA KIDS / 01</small>
        <strong>LIGHT FEET.<br/>BIG ENERGY.</strong>
      </motion.div>
      <motion.div
        className="hero-word-marquee"
        initial={{ opacity: 0, y: reduceMotion ? 0 : 32 }}
        animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: reduceMotion ? 0 : 32 }}
        transition={{ ...reveal, delay: reduceMotion ? 0 : 0.5 }}
        aria-hidden="true"
      >
        <div className="hero-word-track">
          {[0, 1].map((group) => (
            <div className="hero-word-group" key={group}>
              {heroWords.map((word) => <span key={`${group}-${word}`}>{word}<i>✦</i></span>)}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
