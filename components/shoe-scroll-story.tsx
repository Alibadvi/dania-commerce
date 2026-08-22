"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

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
        .to(spinRef.current, { value: Math.PI * 2.35, ease: "none", duration: 3 }, 0)
        .to(".shoe-fallback", { rotationY: 360, rotationZ: 8, ease: "none", duration: 3 }, 0)
        .to(".shoe-bg-sun", { opacity: 1, duration: 0.75 }, 0)
        .to(".shoe-bg-sky", { opacity: 1, duration: 0.8 }, 0.8)
        .to(".shoe-bg-navy", { opacity: 1, duration: 0.85 }, 1.75)
        .to(".shoe-story-copy", { y: -22, opacity: 0, duration: 0.55 }, 1.55)
        .fromTo(".shoe-story-finale", { y: 35, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 2.05);
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0.12, 4.15);
    scene.add(new THREE.HemisphereLight(0xfff8de, 0x172a46, 3.1));
    const key = new THREE.DirectionalLight(0xffffff, 5.2);
    key.position.set(4, 5, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xff765f, 3.5);
    rim.position.set(-4, 1, -3);
    scene.add(rim);

    const pivot = new THREE.Group();
    scene.add(pivot);
    shoeRef.current = pivot;
    let frame = 0;

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load("/models/dania-shoe.glb", (gltf) => {
      const shoe = gltf.scene;
      const box = new THREE.Box3().setFromObject(shoe);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      shoe.position.sub(center);
      shoe.scale.setScalar(2.65 / Math.max(size.x, size.y, size.z));
      shoe.rotation.set(-0.1, 0, 0.08);
      shoe.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.castShadow = false;
        object.receiveShadow = false;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => {
          if (material instanceof THREE.MeshStandardMaterial) {
            material.envMapIntensity = 1.25;
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
        <div className="shoe-story-bg shoe-bg-sun" />
        <div className="shoe-story-bg shoe-bg-sky" />
        <div className="shoe-story-bg shoe-bg-navy" />
        <div className="shoe-orbit" aria-hidden="true" />
        <div className={`shoe-canvas-wrap${loaded || failed ? " is-loaded" : ""}${failed ? " is-fallback" : ""}`}>
          <canvas ref={canvasRef} aria-label="مدل سه‌بعدی کفش کودک که با اسکرول می‌چرخد" />
          {failed && <span className="shoe-fallback" role="img" aria-label="کتانی آبی کودک" />}
          {!loaded && !failed && <span className="shoe-loading">در حال آماده‌سازی سه‌بعدی…</span>}
        </div>
        <div className="shoe-story-copy">
          <span>۳۶۰ درجه آزادی</span>
          <h2 id="shoe-story-title">هر زاویه،<br/><em>برای بازی ساخته شده.</em></h2>
          <p>آرام اسکرول کن و کفش را از هر طرف ببین.</p>
        </div>
        <div className="shoe-story-finale" aria-hidden="true">
          <span>سبک روی پا</span>
          <strong>بزرگ در خیال</strong>
        </div>
        <span className="shoe-scroll-rail" aria-hidden="true"><i /> SCROLL TO SPIN</span>
        <small className="shoe-credit">3D model © Shopify · CC BY 4.0</small>
      </div>
    </section>
  );
}
