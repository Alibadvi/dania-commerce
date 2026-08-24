"use client";

import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { ArrowLeftIcon } from "@/components/icons";

gsap.registerPlugin(ScrollTrigger);

const MOTION_WORLDS = [
  {
    id: "boys",
    label: "BOYS",
    title: "پسرانه",
    description: "برای دویدن، ساختن و کشف کردن.",
    href: "/shop?category=boy",
    asset: "/images/dania-motion-path/boys-world.png",
  },
  {
    id: "girls",
    label: "GIRLS",
    title: "دخترانه",
    description: "برای بازی، رنگ و خیال‌پردازی.",
    href: "/shop?category=girl",
    asset: "/images/dania-motion-path/girls-world.png",
  },
] as const;

const MOVE_MARQUEE = "MOVE • PLAY • DISCOVER • ";
const PLAY_MARQUEE = "SMALL STEPS • BIG ADVENTURES • ";

export function DaniaMotionPath() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const context = gsap.context(() => {
      const revealItems = Array.from(
        section.querySelectorAll<HTMLElement>("[data-motion-reveal]"),
      );

      gsap.set(revealItems, { autoAlpha: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 24 });
      if (reduceMotion) return;

      gsap.to(revealItems, {
        autoAlpha: 1,
        y: 0,
        duration: 0.72,
        stagger: 0.07,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 78%",
          once: true,
        },
      });
    }, section);

    if (reduceMotion) return () => context.revert();

    const media = gsap.matchMedia();
    media.add("all", () => {
      const moveTrack = section.querySelector<HTMLElement>(
        ".motion-ghost-marquee--move .motion-ghost-track",
      );
      const playTrack = section.querySelector<HTMLElement>(
        ".motion-ghost-marquee--play .motion-ghost-track",
      );
      const shoeStage = section.querySelector<HTMLElement>(".motion-stage-shoe");
      const shoe = section.querySelector<HTMLElement>(".motion-shoe-media");

      if (moveTrack) {
        gsap.fromTo(
          moveTrack,
          { xPercent: 0 },
          {
            xPercent: -33.333,
            ease: "none",
            scrollTrigger: {
              trigger: shoeStage ?? section,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.4,
              invalidateOnRefresh: true,
            },
          },
        );
      }

      if (playTrack) {
        gsap.fromTo(
          playTrack,
          { xPercent: -33.333 },
          {
            xPercent: 0,
            ease: "none",
            scrollTrigger: {
              trigger: shoeStage ?? section,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.5,
              invalidateOnRefresh: true,
            },
          },
        );
      }

      if (shoe) {
        gsap.to(shoe, {
          yPercent: 5,
          ease: "none",
          scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 1 },
        });
      }
    });

    return () => {
      media.revert();
      context.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="dania-motion-path" aria-labelledby="motion-path-title">
      <header className="motion-head" data-motion-reveal>
        <span className="motion-head-brand">DANIA</span>
        <span className="motion-head-kicker">FIND YOUR PLAY</span>
        <h2 id="motion-path-title">
          هر قدم،<br />
          <em>یک شروع تازه.</em>
        </h2>
        <p>کفش سبک و نرم؛ آماده برای هر دنیایی که کودک تو انتخاب می‌کند.</p>
      </header>

      <div className="motion-stage">
        <div className="motion-stage-shoe" data-motion-reveal>
          <div className="motion-ghost-marquees" aria-hidden="true">
            <div className="motion-ghost-marquee motion-ghost-marquee--move">
              <div className="motion-ghost-track">
                <span>{MOVE_MARQUEE}</span>
                <span>{MOVE_MARQUEE}</span>
                <span>{MOVE_MARQUEE}</span>
              </div>
            </div>

            <div className="motion-ghost-marquee motion-ghost-marquee--play">
              <div className="motion-ghost-track">
                <span>{PLAY_MARQUEE}</span>
                <span>{PLAY_MARQUEE}</span>
                <span>{PLAY_MARQUEE}</span>
              </div>
            </div>
          </div>

          <span className="motion-stage-label">01 / 02&nbsp;&nbsp;—&nbsp;&nbsp;THE FIRST STEP</span>
          <span className="motion-shoe-glow" aria-hidden="true" />
          <div className="motion-shoe-media">
            <Image
              src="/images/dania-motion-path/main-shoe.webp"
              alt="طرح مفهومی کفش کودک دانیا"
              fill
              priority
              sizes="(max-width: 700px) 88vw, (max-width: 1100px) 48vw, 520px"
            />
          </div>

          <span className="motion-shoe-caption">LIGHTWEIGHT&nbsp;&nbsp;/&nbsp;&nbsp;FLEX&nbsp;&nbsp;/&nbsp;&nbsp;READY</span>
        </div>

        <div className="motion-choice-bar" data-motion-reveal>
          <span>CHOOSE YOUR WORLD</span>
          <i aria-hidden="true" />
          <small>مسیر بازی را تو انتخاب می‌کنی</small>
        </div>

        <div className="motion-worlds">
          {MOTION_WORLDS.map((world, index) => (
            <Link
              key={world.id}
              href={world.href}
              className={`motion-portal motion-portal--${world.id}`}
              data-motion-reveal
            >
              <span className="motion-portal-art" aria-hidden="true">
                <Image src={world.asset} alt="" fill sizes="(max-width: 700px) 92vw, 50vw" />
              </span>
              <span className="motion-portal-shade" aria-hidden="true" />
              <span className="motion-portal-top">
                <span>0{index + 1} / 02</span>
                <b aria-hidden="true"><ArrowLeftIcon /></b>
              </span>
              <span className="motion-portal-copy">
                <strong>{world.label}</strong>
                <small>{world.title} · {world.description}</small>
              </span>
              <span className="motion-portal-cta">EXPLORE <ArrowLeftIcon /></span>
            </Link>
          ))}
        </div>
      </div>

      <div
        className="relative z-[3] flex min-h-20 flex-col items-center justify-end gap-3 bg-[#0b2740] pb-4 font-sans text-[7px] font-bold tracking-[0.22em] text-white/40"
        aria-hidden="true"
        dir="ltr"
      >
        <span>NEXT&nbsp;&nbsp;—&nbsp;&nbsp;FIND YOUR PAIR</span>
        <i className="h-px w-[min(420px,58vw)] bg-gradient-to-r from-transparent via-white/35 to-transparent" />
      </div>
    </section>
  );
}