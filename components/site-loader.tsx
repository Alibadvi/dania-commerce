"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { DaniaWordmark } from "@/components/dania-wordmark";

const loaderCards = [
  { image: "/images/loader-kid-yellow.webp", rotate: -5.5, x: -22, y: 4 },
  { image: "/images/loader-kid-blue.webp", rotate: 4.2, x: 22, y: -2 },
  { image: "/images/loader-kids-coral.webp", rotate: -2.4, x: -10, y: 3 },
  { image: "/images/loader-kid-cream.webp", rotate: 1.4, x: 9, y: -4 },
];

export function SiteLoader({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const previousOverflow = useRef("");
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    previousOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const total = reduceMotion ? 480 : 2380;
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
          <motion.div
            className="loader-topline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduceMotion ? 0 : 0.45, duration: 0.6 }}
            aria-hidden="true"
          >
            <span>DANIA / KIDS</span>
            <span>حرکت · بازی · کشف</span>
          </motion.div>

          <div className="loader-pile" aria-hidden="true">
            {loaderCards.map((card, index) => (
              <motion.div
                key={card.image}
                className="loader-card"
                initial={{ opacity: 0, x: card.x * 2.2, y: "62vh", rotate: card.rotate * 1.8, scale: 0.985 }}
                animate={{ opacity: 1, x: card.x, y: card.y, rotate: card.rotate, scale: 1 }}
                transition={{ delay: reduceMotion ? 0 : 0.1 + index * 0.25, duration: reduceMotion ? 0.1 : 0.82, ease: [0.22, 1, 0.36, 1] }}
              >
                <Image src={card.image} alt="" fill sizes="(max-width: 700px) 62vw, 290px" priority />
              </motion.div>
            ))}
          </div>

          <div className="loader-logo">
            <DaniaWordmark animated />
          </div>

          <div className="loader-status" aria-hidden="true">
            <span>دنیای شادِ پاهای کوچک</span>
            <i><b style={{ transform: `scaleX(${progress / 100})` }} /></i>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
