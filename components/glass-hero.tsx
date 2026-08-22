"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeftIcon } from "@/components/icons";
import { useIntroReady } from "@/components/intro-context";

const heroWords = ["PLAY", "DREAM", "RUN", "GROW", "EXPLORE", "SMILE"];

export function GlassHero() {
  const ready = useIntroReady();
  const reduceMotion = useReducedMotion();
  const reveal = reduceMotion ? { duration: 0.2 } : { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const };
  const photoReveal = reduceMotion ? { duration: 0.2 } : { duration: 1.35, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <section className="dania-hero" aria-labelledby="home-hero-title">
      <motion.div
        className="dania-hero-photo"
        role="img"
        aria-label="کودکی شاد در حال بازی با کفش‌های رنگی دانیا"
        initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : "-5%", scale: reduceMotion ? 1 : 1.035 }}
        animate={ready ? { opacity: 1, y: 0, scale: 1 } : { opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : "-5%", scale: reduceMotion ? 1 : 1.035 }}
        transition={photoReveal}
      />
      <div className="hero-color-wash" aria-hidden="true" />
      <motion.div
        className="dania-hero-copy"
        initial={{ opacity: 0, y: 22 }}
        animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
        transition={{ ...reveal, delay: reduceMotion ? 0 : 0.24 }}
      >
        <h1 id="home-hero-title">بذار راحت<br/><em>بازی کنه.</em></h1>
        <p>کفش‌های دانیا سبک، نرم و مناسب پاهای در حال رشدند.</p>
        <div className="dania-hero-actions">
          <Link href="/shop" className="hero-shop-button" aria-label="دیدن مدل‌ها">
            <span className="hero-button-label-window" aria-hidden="true">
              <span className="hero-button-label-track">
                {[0, 1].map((group) => (
                  <span className="hero-button-label-group" key={group}>
                    <span>دیدن مدل‌ها</span><b>•</b><span>دیدن مدل‌ها</span><b>•</b>
                  </span>
                ))}
              </span>
            </span>
            <i><ArrowLeftIcon /></i>
          </Link>
        </div>
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
