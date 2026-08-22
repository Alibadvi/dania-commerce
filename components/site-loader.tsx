"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const loaderCards = [
  { image: "/images/danya-products.webp", className: "loader-card-blue", rotate: -13, x: -82, y: -15 },
  { image: "/images/danya-catalog-grid.webp", className: "loader-card-lilac", rotate: 9, x: 74, y: 7 },
  { image: "/images/danya-hero-dark.webp", className: "loader-card-dark", rotate: -5, x: -34, y: 20 },
  { image: "/images/danya-hero.webp", className: "loader-card-coral", rotate: 5, x: 42, y: 31 },
];

export function SiteLoader({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const previousOverflow = useRef("");
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    previousOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const total = reduceMotion ? 480 : 2450;
    const started = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const next = Math.min(100, Math.round(((now - started) / total) * 100));
      setProgress(next);
      if (next < 100) frame = requestAnimationFrame(tick);
      else window.setTimeout(() => setVisible(false), reduceMotion ? 80 : 220);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduceMotion]);

  const finish = () => {
    document.body.style.overflow = previousOverflow.current;
    onComplete();
  };

  return (
    <AnimatePresence onExitComplete={finish}>
      {visible && (
        <motion.div
          className="site-loader"
          initial={false}
          exit={{ y: "-104%" }}
          transition={{ duration: reduceMotion ? 0.18 : 0.88, ease: [0.76, 0, 0.24, 1] }}
          aria-label="در حال آماده‌سازی دانیا"
        >
          <div className="loader-pile" aria-hidden="true">
            {loaderCards.map((card, index) => (
              <motion.div
                key={`${card.image}-${card.className}`}
                className={`loader-card ${card.className}`}
                initial={{ opacity: 0, y: 170, rotate: 0, scale: 0.72 }}
                animate={{ opacity: 1, x: card.x, y: card.y, rotate: card.rotate, scale: 1 }}
                transition={{ delay: reduceMotion ? 0 : 0.16 + index * 0.22, duration: reduceMotion ? 0.1 : 0.66, ease: [0.16, 1, 0.3, 1] }}
              >
                <Image src={card.image} alt="" fill sizes="(max-width: 700px) 42vw, 260px" priority />
              </motion.div>
            ))}
          </div>

          <motion.div
            className="loader-logo"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: reduceMotion ? 0 : 0.72, duration: 0.65 }}
          >
            <Image src="/brand/dania-logo-loader.webp" alt="DANIA" fill sizes="(max-width: 700px) 84vw, 760px" priority />
          </motion.div>

          <div className="loader-meta" aria-hidden="true">
            <span>دنیای شادِ پاهای کوچک</span>
            <b>{progress.toLocaleString("fa-IR").padStart(3, "۰")}</b>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
