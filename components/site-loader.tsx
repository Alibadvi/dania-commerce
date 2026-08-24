"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { DaniaWordmark } from "@/components/dania-wordmark";

const loaderCards = [
  { image: "/images/loader-kid-yellow.webp", rotate: -7, x: -30, y: 7 },
  { image: "/images/loader-kid-blue.webp", rotate: 5.5, x: 26, y: -5 },
  { image: "/images/loader-kids-coral.webp", rotate: -3.8, x: -15, y: 4 },
  { image: "/images/loader-kid-cream.webp", rotate: 2.5, x: 17, y: -3 },
  { image: "/images/loader-kid-blue.webp", rotate: -5, x: -21, y: 5 },
  { image: "/images/loader-kid-yellow.webp", rotate: 4.3, x: 22, y: -4 },
  { image: "/images/loader-kid-cream.webp", rotate: -2, x: -10, y: 2 },
  { image: "/images/loader-kids-coral.webp", rotate: 1.3, x: 9, y: -3 },
];

export function SiteLoader({ onComplete, mode = "initial" }: { onComplete: () => void; mode?: "initial" | "route" }) {
  const [visible, setVisible] = useState(true);
  const previousOverflow = useRef("");
  const reduceMotion = useReducedMotion();
  const isRouteTransition = mode === "route";

  useEffect(() => {
    previousOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => setVisible(false), reduceMotion ? 200 : isRouteTransition ? 450 : 1200);
    return () => window.clearTimeout(timer);
  }, [isRouteTransition, reduceMotion]);

  const finish = () => {
    document.body.style.overflow = previousOverflow.current;
    onComplete();
  };

  return (
    <AnimatePresence onExitComplete={finish}>
      {visible && (
        <motion.div
          className={`site-loader${isRouteTransition ? " is-route-transition" : ""}`}
          initial={false}
          exit={{ y: "-104%" }}
          transition={{ duration: reduceMotion ? 0.18 : isRouteTransition ? 0.52 : 0.88, ease: [0.76, 0, 0.24, 1] }}
          aria-label="در حال آماده‌سازی دانیا"
        >
          <div className="loader-pile" aria-hidden="true">
            {loaderCards.map((card, index) => (
              <motion.div
                key={`${card.image}-${index}`}
                className="loader-card"
                initial={{ opacity: 0, x: 0, y: 0, rotate: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 1], x: [0, card.x * 0.2, card.x], y: [0, card.y * 0.2, card.y], rotate: [0, card.rotate * 0.35, card.rotate], scale: [0, 1.035, 1] }}
                transition={{ delay: reduceMotion ? 0 : isRouteTransition ? 0.02 + index * 0.07 : 0.05 + index * 0.19, duration: reduceMotion ? 0.1 : isRouteTransition ? 0.36 : 0.68, times: [0, 0.78, 1], ease: [0.22, 1, 0.36, 1] }}
              >
                <Image src={card.image} alt="" fill sizes="(max-width: 700px) 62vw, 290px" priority />
              </motion.div>
            ))}
          </div>

          <motion.div
            className="loader-logo"
            initial={reduceMotion ? false : { opacity: 0.28, scale: 0.94, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ delay: reduceMotion ? 0 : isRouteTransition ? 0.06 : 0.18, duration: reduceMotion ? 0.1 : isRouteTransition ? 0.42 : 0.82, ease: [0.16, 1, 0.3, 1] }}
          >
            <DaniaWordmark />
          </motion.div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
