"use client";

import gsap from "gsap";
import Link from "next/link";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { ArrowLeftIcon } from "@/components/icons";

gsap.registerPlugin(ScrollTrigger);

export function ShoeScrollStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shoeRef = useRef<THREE.Group | null>(null);
  const spinRef = useRef({ value: 0 });
  const [shouldLoad, setShouldLoad] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShouldLoad(true);
        observer.disconnect();
      }
    }, { rootMargin: "450px" });
    observer.observe(section);
    return () => observer.disconnect();
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
        .to(spinRef.current, { value: Math.PI * 3.15, ease: "none", duration: 3.25 }, 0)
        .to(".shoe-fallback", { rotationY: 480, rotationZ: 7, ease: "none", duration: 3.25 }, 0)
        .to(".shoe-story-entry", { opacity: 0, yPercent: -12, duration: 0.52 }, 0.1)
        .to(".shoe-bg-iris", { opacity: 1, duration: 0.9 }, 0.25)
        .fromTo(".shoe-story-copy", { y: 42, opacity: 0 }, { y: 0, opacity: 1, duration: 0.58 }, 0.42)
        .to(".shoe-bg-night", { opacity: 1, duration: 1.05 }, 1.7)
        .to(".shoe-story-copy", { y: -34, opacity: 0, duration: 0.5 }, 1.72)
        .fromTo(".shoe-story-finale", { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.65 }, 2.08)
        .fromTo(".shoe-story-progress i", { scaleX: 0 }, { scaleX: 1, ease: "none", duration: 3.25 }, 0);
    }, section);
    return () => context.revert();
  }, []);

  useEffect(() => {
    if (!shouldLoad || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const wrapper = canvas.parentElement;
    if (!wrapper) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch {
      queueMicrotask(() => setFailed(true));
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.94;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0.1, 4.05);
    scene.add(new THREE.HemisphereLight(0xe9f8ff, 0x10172f, 2.8));
    const key = new THREE.DirectionalLight(0xfff2e6, 4.8);
    key.position.set(4, 5, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xff6076, 4.2);
    rim.position.set(-4, 1, -3);
    scene.add(rim);
    const fill = new THREE.DirectionalLight(0x7fdcff, 3.3);
    fill.position.set(-3, -1, 4);
    scene.add(fill);

    const pivot = new THREE.Group();
    scene.add(pivot);
    shoeRef.current = pivot;
    let frame = 0;

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load("/models/dania-shoe.glb", async (gltf) => {
      const shoe = gltf.scene;
      const streetMaterial = await gltf.parser.getDependency("material", 2) as THREE.Material;
      const box = new THREE.Box3().setFromObject(shoe);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      shoe.position.sub(center);
      shoe.scale.setScalar(2.85 / Math.max(size.x, size.y, size.z));
      shoe.scale.y *= 1.12;
      shoe.rotation.set(-0.08, 0, 0.06);
      shoe.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.castShadow = false;
        object.receiveShadow = false;
        object.material = streetMaterial;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => {
          if (material instanceof THREE.MeshStandardMaterial) {
            material.envMapIntensity = 0.72;
            material.roughness = Math.max(material.roughness, 0.42);
            material.needsUpdate = true;
          }
        });
      });
      pivot.add(shoe);
      setLoaded(true);
    }, undefined, () => setFailed(true));

    const resize = () => {
      const width = wrapper.clientWidth;
      const height = wrapper.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrapper);
    resize();

    const render = () => {
      const shoe = shoeRef.current;
      if (shoe) {
        shoe.rotation.y = -0.62 + spinRef.current.value;
        shoe.rotation.x = -0.09 + Math.sin(spinRef.current.value * 0.72) * 0.12;
        shoe.rotation.z = 0.08 + Math.sin(spinRef.current.value * 0.44) * 0.055;
      }
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      });
      renderer.dispose();
      shoeRef.current = null;
    };
  }, [shouldLoad]);

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
        <div className={`shoe-canvas-wrap${loaded || failed ? " is-loaded" : ""}${failed ? " is-fallback" : ""}`}>
          <canvas ref={canvasRef} aria-label="مدل سه‌بعدی کفش کودک که با اسکرول می‌چرخد" />
          {failed && <span className="shoe-fallback" role="img" aria-label="کتانی آبی کودک" />}
          {!loaded && !failed && <span className="shoe-loading">در حال آماده‌سازی سه‌بعدی…</span>}
        </div>
        <div className="shoe-story-copy">
          <span>جزئیات از نزدیک</span>
          <h2 id="shoe-story-title">وزن کم.<br/><em>انعطاف بیشتر.</em></h2>
          <p>اسکرول کن تا کفش بچرخد.</p>
        </div>
        <div className="shoe-story-finale">
          <span>مدل بعدی</span>
          <strong>کفش مناسبش را پیدا کن.</strong>
          <Link href="/shop">دیدن کفش‌ها <ArrowLeftIcon /></Link>
        </div>
        <span className="shoe-scroll-rail" aria-hidden="true"><i /> SCROLL / SPIN</span>
        <span className="shoe-story-progress" aria-hidden="true"><i /></span>
        <small className="shoe-credit">3D model © Shopify · CC BY 4.0</small>
      </div>
    </section>
  );
}
