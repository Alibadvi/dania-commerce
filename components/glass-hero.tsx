"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeftIcon } from "@/components/icons";
import { useIntroReady } from "@/components/intro-context";

const heroWords = ["PLAY", "DREAM", "RUN", "GROW", "EXPLORE", "SMILE"];
const heroTopWords = ["DANIA KIDS", "LIGHT STEPS", "MADE FOR PLAY"];

export function GlassHero() {
  const ready = useIntroReady();
  const reduceMotion = useReducedMotion();
  const reveal = reduceMotion ? { duration: 0.2 } : { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const };
  const photoReveal = reduceMotion ? { duration: 0.2 } : { duration: 1.35, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <section className="relative isolate h-[max(720px,calc(100svh-92px))] overflow-hidden bg-[#e8e6df] text-[#132b48] max-[700px]:h-[clamp(700px,calc(100svh-68px),840px)] max-[700px]:bg-[#0c2039]" aria-labelledby="home-hero-title">
      <motion.div
        className="absolute inset-0 -z-[3] origin-center bg-[#e8e6df] bg-[url('/images/dania-hero-crop-safe-desktop-v5.webp')] bg-cover bg-[center_49%] bg-no-repeat will-change-transform max-[700px]:h-full max-[700px]:origin-top max-[700px]:bg-[url('/images/dania-mobile-hero-overlay-safe-v5.webp')] max-[700px]:bg-cover max-[700px]:bg-[center_38%]"
        role="img"
        aria-label="کودکان شاد در حال بازی با کفش‌های رنگی دانیا"
        initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : "-2%", scale: reduceMotion ? 1 : 1.02 }}
        animate={ready ? { opacity: 1, y: 0, scale: 1 } : { opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : "-2%", scale: reduceMotion ? 1 : 1.02 }}
        transition={photoReveal}
      />
      <div className="absolute inset-0 -z-[2] bg-[linear-gradient(90deg,rgba(232,230,223,0)_43%,rgba(232,230,223,.05)_62%,rgba(232,230,223,.66)_100%)] max-[700px]:bg-[linear-gradient(180deg,rgba(8,24,44,0)_45%,rgba(8,24,44,.08)_60%,rgba(8,24,44,.9)_100%)]" aria-hidden="true" />

      <motion.div
        className="absolute inset-x-0 top-0 z-[6] flex h-8 items-center overflow-hidden border-b border-white/70 bg-[rgba(241,244,242,.48)] text-[#132b48]/65 backdrop-blur-xl [direction:ltr] max-[700px]:h-[30px] max-[700px]:border-white/20 max-[700px]:bg-[rgba(19,43,72,.84)] max-[700px]:text-white/90"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : { opacity: 0 }}
        transition={{ ...reveal, delay: reduceMotion ? 0 : 0.18 }}
        aria-hidden="true"
      >
        <div className="flex w-max shrink-0 animate-[hero-top-flow_32s_linear_infinite] motion-reduce:animate-none max-[700px]:[animation-duration:27s]">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((group) => (
            <div className="flex shrink-0 items-center" key={group}>
              {heroTopWords.map((word) => <span className="inline-flex items-center gap-8 whitespace-nowrap pl-8 font-sans text-[8px] font-semibold tracking-[1.7px] max-[700px]:gap-[25px] max-[700px]:pl-[25px] max-[700px]:tracking-[1.45px]" key={`${group}-${word}`}>{word}<i className="text-[8px] not-italic text-[#ff777d]">•</i></span>)}
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="absolute right-[clamp(32px,7.4vw,118px)] top-[49%] z-[3] w-[min(35vw,430px)] -translate-y-1/2 max-[980px]:right-[5vw] max-[980px]:w-[min(40vw,400px)] max-[700px]:inset-x-[22px] max-[700px]:bottom-[84px] max-[700px]:top-auto max-[700px]:w-auto max-[700px]:translate-y-0 max-[390px]:inset-x-[18px]"
        initial={{ opacity: 0, y: 22 }}
        animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
        transition={{ ...reveal, delay: reduceMotion ? 0 : 0.24 }}
      >
        <span className="mb-3 block text-[10px] font-medium tracking-[.15px] text-[#132b48]/60 max-[700px]:mb-[7px] max-[700px]:text-[8px] max-[700px]:text-white/70">کفش کودک دانیا</span>
        <h1 id="home-hero-title" className="mb-6 max-w-[430px] text-[clamp(38px,3.35vw,52px)] font-semibold leading-[1.32] tracking-[-.45px] text-[#132b48] max-[980px]:text-[clamp(33px,4.8vw,45px)] max-[700px]:mb-[15px] max-[700px]:max-w-[330px] max-[700px]:text-[clamp(29px,8.1vw,34px)] max-[700px]:font-medium max-[700px]:leading-[1.38] max-[700px]:tracking-[-.3px] max-[700px]:text-white max-[700px]:[text-shadow:0_3px_24px_rgba(3,14,27,.34)] max-[390px]:text-[27px]">پاهاشون راحت؛<br />خیال‌تون راحت.</h1>
        <div className="flex items-center">
          <Link href="/shop" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-[13px] bg-[#132b48] px-[18px] py-[10px] text-[11px] font-semibold text-white transition duration-200 hover:-translate-y-px hover:bg-[#1c3a60] focus-visible:-translate-y-px focus-visible:bg-[#1c3a60] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#ff777d] [&_svg]:size-3.5 [&_svg]:transition-transform hover:[&_svg]:-translate-x-0.5 focus-visible:[&_svg]:-translate-x-0.5 motion-reduce:transition-none motion-reduce:[&_svg]:transition-none max-[700px]:min-h-[43px] max-[700px]:rounded-[11px] max-[700px]:bg-[#f7f4ec] max-[700px]:px-[15px] max-[700px]:py-2 max-[700px]:text-[10px] max-[700px]:text-[#102b4a] max-[700px]:hover:bg-white max-[700px]:focus-visible:bg-white">
            <span>دیدن کفش‌ها</span><ArrowLeftIcon />
          </Link>
        </div>
      </motion.div>

      <motion.div
        className="absolute inset-x-0 bottom-0 z-[6] flex h-[72px] items-center overflow-hidden border-t border-white/80 bg-[rgba(232,238,237,.78)] text-[#132b48] backdrop-blur-2xl [direction:ltr] max-[700px]:h-14 max-[700px]:border-white/20 max-[700px]:bg-[rgba(8,24,44,.78)] max-[700px]:text-white"
        initial={{ opacity: 0, y: reduceMotion ? 0 : 32 }}
        animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: reduceMotion ? 0 : 32 }}
        transition={{ ...reveal, delay: reduceMotion ? 0 : 0.5 }}
        aria-hidden="true"
      >
        <div className="flex w-max shrink-0 animate-[hero-word-flow_24s_linear_infinite] will-change-transform motion-reduce:animate-none max-[700px]:[animation-duration:19s]">
          {[0, 1].map((group) => (
            <div className="flex shrink-0 items-center" key={group}>
              {heroWords.map((word) => <span className="inline-flex items-center gap-[clamp(34px,4vw,68px)] whitespace-nowrap pl-[clamp(34px,4vw,68px)] font-sans text-[clamp(18px,1.7vw,26px)] font-bold tracking-[2.2px] text-[#132b48]/85 max-[700px]:gap-7 max-[700px]:pl-7 max-[700px]:text-base max-[700px]:tracking-[1.8px] max-[700px]:text-white/85" key={`${group}-${word}`}>{word}<i className="text-[.58em] not-italic text-[#ff777d] [text-shadow:0_0_14px_rgba(255,119,125,.42)]">✦</i></span>)}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}