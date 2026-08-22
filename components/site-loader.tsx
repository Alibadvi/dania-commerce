"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { DaniaWordmark } from "@/components/dania-wordmark";

const loaderCards = [
  { image: "/images/loader-kid-yellow.webp", rotate: -7, x: -30, y: 7, fromX: -150, fromY: "58vh", fromRotate: -18 },
  { image: "/images/loader-kid-blue.webp", rotate: 5.5, x: 26, y: -5, fromX: 160, fromY: "-54vh", fromRotate: 17 },
  { image: "/images/loader-kids-coral.webp", rotate: -3.8, x: -15, y: 4, fromX: -185, fromY: "-24vh", fromRotate: -15 },
  { image: "/images/loader-kid-cream.webp", rotate: 2.5, x: 17, y: -3, fromX: 175, fromY: "45vh", fromRotate: 14 },
  { image: "/images/loader-kid-blue.webp", rotate: -5, x: -21, y: 5, fromX: -165, fromY: "38vh", fromRotate: -17 },
  { image: "/images/loader-kid-yellow.webp", rotate: 4.3, x: 22, y: -4, fromX: 170, fromY: "-38vh", fromRotate: 16 },
  { image: "/images/loader-kid-cream.webp", rotate: -2, x: -10, y: 2, fromX: -135, fromY: "-56vh", fromRotate: -13 },
  { image: "/images/loader-kids-coral.webp", rotate: 1.3, x: 9, y: -3, fromX: 130, fromY: "58vh", fromRotate: 12 },
];

export function SiteLoader({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const previousOverflow = useRef("");
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    previousOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const total = reduceMotion ? 480 : 3000;
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
                key={`${card.image}-${index}`}
                className="loader-card"
                initial={{ opacity: 0, x: card.fromX, y: card.fromY, rotate: card.fromRotate, scale: 0.97 }}
                animate={{ opacity: 1, x: card.x, y: card.y, rotate: card.rotate, scale: 1 }}
                transition={{ delay: reduceMotion ? 0 : 0.06 + index * 0.2, duration: reduceMotion ? 0.1 : 0.76, ease: [0.22, 1, 0.36, 1] }}
              >
                <Image src={card.image} alt="" fill sizes="(max-width: 700px) 62vw, 290px" priority />
              </motion.div>
            ))}
          </div>

          <motion.div
            className="loader-logo"
            initial={reduceMotion ? false : { opacity: 0.28, scale: 0.94, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ delay: reduceMotion ? 0 : 0.18, duration: reduceMotion ? 0.1 : 0.82, ease: [0.16, 1, 0.3, 1] }}
          >
            <DaniaWordmark />
          </motion.div>

          <div className="loader-status" aria-hidden="true">
            <span>دنیای شادِ پاهای کوچک</span>
            <i><b style={{ transform: `scaleX(${progress / 100})` }} /></i>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
