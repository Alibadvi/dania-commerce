"use client";

import type { Application, SPEObject } from "@splinetool/runtime";
import gsap from "gsap";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeftIcon } from "@/components/icons";

gsap.registerPlugin(ScrollTrigger);

const SPLINE_SCENE = "https://prod.spline.design/8SpvxCVlElOUYaVL/scene.splinecode";
const SPLINE_SHOE_NAME = "AirMax";
const SPLINE_BRAND_OBJECTS = /^(?:Text(?: .*)?|NIkeLogo|NIKE|nike|AIR|MAX|Texty|AirMaxStripey|gum outsole|air-cushioned|In the bustling.*|Designed with precision.*)$/i;
const SplineScene = dynamic(() => import("@splinetool/react-spline"), { ssr: false });

type TransformSnapshot = {
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
};

export function ShoeScrollStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const splineAppRef = useRef<Application | null>(null);
  const shoeRef = useRef<SPEObject | null>(null);
  const baseTransformRef = useRef<TransformSnapshot | null>(null);
  const spinRef = useRef({ value: 0 });
  const [shouldLoad, setShouldLoad] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleSplineLoad = useCallback((app: Application) => {
    splineAppRef.current = app;
    app.setBackgroundColor("rgba(0, 0, 0, 0)");

    for (const object of app.getAllObjects()) {
      if (SPLINE_BRAND_OBJECTS.test(object.name.trim())) object.hide();
    }

    const shoe = app.findObjectByName(SPLINE_SHOE_NAME);
    if (!shoe) {
      setFailed(true);
      return;
    }

    const viewportScale = window.matchMedia("(max-width: 700px)").matches ? 0.78 : 0.92;
    shoeRef.current = shoe;
    baseTransformRef.current = {
      rotation: { x: shoe.rotation.x, y: shoe.rotation.y, z: shoe.rotation.z },
      scale: { x: shoe.scale.x, y: shoe.scale.y, z: shoe.scale.z },
    };
    shoe.scale.x *= viewportScale;
    shoe.scale.y *= viewportScale;
    shoe.scale.z *= viewportScale;
    setFailed(false);
    setLoaded(true);
    window.setTimeout(() => ScrollTrigger.refresh(), 80);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShouldLoad(true);
        observer.disconnect();
      }
    }, { rootMargin: "1600px 0px" });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldLoad) return;
    const timeout = window.setTimeout(() => {
      if (!shoeRef.current) setFailed(true);
    }, 18000);
    return () => window.clearTimeout(timeout);
  }, [shouldLoad]);

  useEffect(() => {
    let frame = 0;
    const renderScrollTransform = () => {
      const shoe = shoeRef.current;
      const base = baseTransformRef.current;
      if (shoe && base) {
        const spin = spinRef.current.value;
        shoe.rotation.y = base.rotation.y + spin;
        shoe.rotation.x = base.rotation.x + Math.sin(spin * 0.62) * 0.075;
        shoe.rotation.z = base.rotation.z + Math.sin(spin * 0.38) * 0.035;
      }
      frame = window.requestAnimationFrame(renderScrollTransform);
    };
    frame = window.requestAnimationFrame(renderScrollTransform);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const context = gsap.context(() => {
      if (reduceMotion) return;

      const entrance = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 92%",
          end: "top top",
          scrub: 1.15,
          invalidateOnRefresh: true,
        },
      });
      entrance
        .fromTo(".shoe-story-sticky", { clipPath: "inset(8% 3.5% 0 3.5% round 40px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none" }, 0)
        .fromTo(".shoe-parallax-word--one", { xPercent: -18, yPercent: 24 }, { xPercent: 8, yPercent: -5, ease: "none" }, 0)
        .fromTo(".shoe-parallax-word--two", { xPercent: 16, yPercent: 34 }, { xPercent: -9, yPercent: -3, ease: "none" }, 0)
        .fromTo(".shoe-canvas-wrap", { "--shoe-y": "18vh", "--shoe-scale": 0.72 }, { "--shoe-y": "0vh", "--shoe-scale": 1, ease: "none" }, 0);

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });
      timeline
        .to(spinRef.current, { value: Math.PI * 3.15, ease: "none", duration: 3.5 }, 0)
        .to(".shoe-fallback", { rotationY: 480, rotationZ: 7, ease: "none", duration: 3.5 }, 0)
        .to(".shoe-story-entry", { opacity: 0, yPercent: -12, duration: 0.52 }, 0.1)
        .to(".shoe-bg-iris", { opacity: 1, duration: 0.95 }, 0.32)
        .fromTo(".shoe-story-copy", { y: 34, opacity: 0 }, { y: 0, opacity: 1, duration: 0.62 }, 0.48)
        .to(".shoe-bg-night", { opacity: 1, duration: 1.08 }, 1.82)
        .to(".shoe-story-copy", { y: -28, opacity: 0, duration: 0.46 }, 1.88)
        .fromTo(".shoe-story-finale", { y: 32, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.62 }, 2.23)
        .fromTo(".shoe-story-bridge", { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 0.56, ease: "none" }, 3.04)
        .fromTo(".shoe-story-progress i", { scaleX: 0 }, { scaleX: 1, ease: "none", duration: 3.5 }, 0);
    }, section);
    return () => context.revert();
  }, []);

  useEffect(() => () => {
    splineAppRef.current = null;
    shoeRef.current = null;
    baseTransformRef.current = null;
  }, []);

  return (
    <section ref={sectionRef} className="shoe-story" aria-labelledby="shoe-story-title">
      <div className="shoe-story-sticky">
        <div className="shoe-story-bg shoe-bg-pearl" />
        <div className="shoe-story-bg shoe-bg-iris" />
        <div className="shoe-story-bg shoe-bg-night" />
        <div className="shoe-story-entry" aria-hidden="true">
          <span className="shoe-parallax-word shoe-parallax-word--one">MOVE</span>
          <span className="shoe-parallax-word shoe-parallax-word--two">PLAY</span>
        </div>
        <div className="shoe-orbit" aria-hidden="true"><i /><b /></div>
        <div
          className={`shoe-canvas-wrap shoe-spline-wrap${loaded || failed ? " is-loaded" : ""}${failed ? " is-fallback" : ""}`}
          role="img"
          aria-label="مدل سه‌بعدی کفش کودک که با اسکرول می‌چرخد"
        >
          {shouldLoad && !failed && (
            <SplineScene
              className="shoe-spline"
              scene={SPLINE_SCENE}
              onLoad={handleSplineLoad}
              renderOnDemand={false}
            />
          )}
          {failed && <span className="shoe-fallback" aria-hidden="true" />}
          {!loaded && !failed && <span className="shoe-loading">در حال آماده‌سازی سه‌بعدی…</span>}
        </div>
        <div className="shoe-story-copy">
          <span>برای دویدن، پریدن، کشف کردن</span>
          <h2 id="shoe-story-title">راحت برای امروز.<br/><em>آماده برای هر بازی.</em></h2>
          <p>با اسکرول، کفش را از هر زاویه ببین.</p>
        </div>
        <div className="shoe-story-finale">
          <span>انتخاب با تو</span>
          <strong>کفشی که پا به پات می‌آد.</strong>
          <Link href="/shop">دیدن کفش‌ها <ArrowLeftIcon /></Link>
        </div>
        <div className="shoe-story-bridge" aria-hidden="true">
          <span>NEXT</span><span>MOVE</span>
        </div>
        <span className="shoe-scroll-rail" aria-hidden="true"><i /> SCROLL / SPIN</span>
        <span className="shoe-story-progress" aria-hidden="true"><i /></span>
        <small className="shoe-credit">Interactive 3D scene via Spline</small>
      </div>
    </section>
  );
}
