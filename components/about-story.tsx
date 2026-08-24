"use client";

import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { ArrowLeftIcon, RefreshIcon, ShieldIcon } from "@/components/icons";

gsap.registerPlugin(ScrollTrigger);

const principles = [
  {
    number: "۰۱",
    label: "قالب",
    title: "فضای کافی برای انگشت‌ها",
    text: "پنجه کفش باید اجازه دهد انگشت‌ها هنگام راه‌رفتن باز شوند. قالب دانیا در جلو جادار و در پاشنه کنترل‌شده طراحی می‌شود.",
  },
  {
    number: "۰۲",
    label: "زیره",
    title: "انعطاف در محل درست",
    text: "زیره باید همراه پنجه خم شود، نه از وسط پا. شیارها و ضخامت زیره با همین معیار بررسی می‌شوند.",
  },
  {
    number: "۰۳",
    label: "وزن",
    title: "مواد کمتر، کارایی بیشتر",
    text: "هر قطعه‌ای که به دوام، راحتی یا ثبات کمک نکند حذف می‌شود تا کفش در استفاده روزمره سبک بماند.",
  },
] as const;

const process = [
  ["01", "بررسی قالب", "طول، عرض پنجه و نگه‌داری پاشنه روی نمونه‌های واقعی کنترل می‌شود."],
  ["02", "آزمون حرکت", "انعطاف زیره، وزن و ثبات کفش در راه‌رفتن و دویدن ارزیابی می‌شود."],
  ["03", "بازخورد پوشیدن", "راحتی پوشیدن، بستن کفش و تجربه چند ساعت استفاده ثبت می‌شود."],
  ["04", "اصلاح تولید", "نکته‌های تکرارشونده پیش از تولید یا در سری بعدی به تغییر مشخص تبدیل می‌شوند."],
] as const;

export function AboutStory() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

      intro
        .from("[data-about-kicker]", { y: 16, opacity: 0, duration: 0.55 })
        .from(
          "[data-about-title] > span > i",
          { yPercent: 110, rotate: 2, duration: 0.9, stagger: 0.1 },
          "-=0.2",
        )
        .from("[data-about-copy]", { y: 24, opacity: 0, duration: 0.7 }, "-=0.5")
        .from(
          "[data-about-shoe]",
          { xPercent: -10, yPercent: 7, rotate: -6, opacity: 0, duration: 1.05 },
          "-=0.82",
        );

      media.add("(min-width: 768px)", () => {
        gsap.to("[data-about-shoe]", {
          yPercent: 8,
          rotate: 2.5,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-about-hero]",
            start: "top top",
            end: "bottom top",
            scrub: 0.8,
          },
        });

        gsap.to("[data-about-word]", {
          xPercent: -10,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-about-hero]",
            start: "top top",
            end: "bottom top",
            scrub: 0.8,
          },
        });

        gsap.from("[data-principle]", {
          y: 52,
          opacity: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: "[data-principles]", start: "top 78%", once: true },
        });

        gsap.from("[data-manifesto-line]", {
          yPercent: 110,
          duration: 0.9,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: "[data-manifesto]", start: "top 72%", once: true },
        });

        gsap.from("[data-process-row]", {
          x: 36,
          opacity: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: { trigger: "[data-process]", start: "top 74%", once: true },
        });

        gsap.from("[data-about-cta] > *", {
          y: 24,
          opacity: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: "[data-about-cta]", start: "top 82%", once: true },
        });
      });
    }, root);

    return () => {
      media.revert();
      context.revert();
    };
  }, []);

  return (
    <main
      ref={rootRef}
      className="overflow-hidden bg-[#f7f1e8] text-[#102b49] [font-family:inherit]"
      dir="rtl"
    >
      <section
        data-about-hero
        className="relative isolate min-h-[calc(100svh-78px)] overflow-hidden bg-[#0c2943] text-[#fff4e3]"
      >
        <div
          className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_16%_30%,rgba(255,116,111,.09),transparent_27%),radial-gradient(circle_at_82%_36%,rgba(120,203,233,.1),transparent_30%)]"
          aria-hidden="true"
        />
        <div
          data-about-word
          className="pointer-events-none absolute -left-[4vw] top-[16%] -z-10 hidden whitespace-nowrap text-[clamp(150px,28vw,500px)] font-black leading-none tracking-[-0.09em] text-white/[0.03] sm:block"
          dir="ltr"
          aria-hidden="true"
        >
          MOVE FREE
        </div>

        <div className="mx-auto grid min-h-[calc(100svh-78px)] w-[min(1280px,calc(100%_-_2rem))] items-center gap-6 pb-16 pt-20 md:grid-cols-[1.05fr_0.95fr] md:gap-8 md:px-5 md:py-16 lg:px-7">
          <div className="relative z-10 pt-4 md:pt-0">
            <span
              data-about-kicker
              className="inline-flex rounded-full border border-white/20 bg-white/[0.035] px-4 py-2 text-[9px] font-bold tracking-[0.18em] !text-[#f3c744] backdrop-blur-sm"
              dir="ltr"
            >
              OUR STORY / 2026
            </span>

            <h1
              data-about-title
              className="my-7 text-[clamp(47px,7vw,98px)] font-black leading-[0.96] tracking-[-0.07em] !text-[#fff4e3]"
            >
              <span className="block overflow-hidden">
                <i className="block not-italic">کفش برای</i>
              </span>
              <span className="block overflow-hidden">
                <i className="block not-italic !text-[#ff8179]">حرکت ساخته می‌شود،</i>
              </span>
              <span className="block overflow-hidden">
                <i className="block not-italic">نه فقط دیده‌شدن.</i>
              </span>
            </h1>

            <p
              data-about-copy
              className="max-w-xl text-[13px] font-medium leading-8 !text-[#c4d3dc]/80 md:text-[15px] md:leading-9"
            >
              دانیا از یک سؤال ساده شروع شد: چرا کفش کودک باید سرعت بازی را کم کند؟ ما کفشی
              می‌سازیم که سبک، راحت و همراه حرکت باشد؛ نه مانعی مقابل آن.
            </p>
          </div>

          <div className="relative min-h-[360px] sm:min-h-[440px] md:min-h-[620px]">
            <div className="absolute inset-[8%_1%_5%] rounded-[48%_48%_32px_32px] bg-[#f3c744] shadow-[12px_14px_0_#ff8179] md:inset-[8%_4%_6%] md:shadow-[16px_18px_0_#ff8179]" />
            <div data-about-shoe className="absolute inset-0 z-10 will-change-transform">
              <Image
                src="/images/dania-motion-path/main-shoe.webp"
                alt="کفش کودک دانیا"
                fill
                priority
                sizes="(max-width: 768px) calc(100vw - 32px), 48vw"
                className="object-contain drop-shadow-[0_30px_32px_rgba(0,0,0,.3)]"
              />
            </div>
            <span className="absolute bottom-4 right-3 z-20 grid size-20 rotate-3 place-items-center rounded-full border-2 border-[#0c2943] bg-[#78cbe9] text-center text-[9px] font-black leading-5 !text-[#0c2943] shadow-[4px_4px_0_#0c2943] sm:size-24 md:bottom-5 md:right-5 md:size-28 md:text-[10px]">
              طراحی برای
              <br />
              حرکت آزاد
            </span>
          </div>
        </div>
      </section>

      <section
        data-principles
        className="border-b border-[#102b49]/10 bg-[#f7f1e8] px-4 py-20 md:px-8 md:py-28"
      >
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-12 grid gap-6 md:grid-cols-[1fr_0.75fr] md:items-end">
            <div>
              <span className="text-[9px] font-bold tracking-[0.16em] !text-[#e56862]" dir="ltr">
                DESIGN NOTES / 01—03
              </span>
              <h2 className="mt-4 max-w-3xl text-[clamp(39px,5.3vw,70px)] font-black leading-[1.06] tracking-[-0.055em] !text-[#102b49]">
                سه تصمیمی که شکل هر کفش دانیا را تعیین می‌کند.
              </h2>
            </div>
            <p className="max-w-md text-[12px] leading-8 !text-[#667985] md:justify-self-end md:text-[13px]">
              ظاهر مدل‌ها تغییر می‌کند؛ معیارهای اصلی نه. فرم طبیعی پا، انعطاف کنترل‌شده و وزن
              مناسب، نقطه شروع هر طراحی‌اند.
            </p>
          </div>

          <div className="grid border-t border-[#102b49]/15 md:grid-cols-3">
            {principles.map((item, index) => (
              <article
                data-principle
                key={item.number}
                className={`relative flex min-h-[230px] flex-col border-b border-[#102b49]/15 px-2 py-7 transition duration-300 hover:bg-white/45 md:min-h-[340px] md:border-b-0 md:px-8 md:py-10 ${
                  index ? "md:border-r" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black !text-[#e56862]">{item.number}</span>
                  <small className="text-[10px] font-black !text-[#8b9aa2]">{item.label}</small>
                </div>
                <div className="mt-auto pt-10 md:pt-14">
                  <h3 className="max-w-xs text-[22px] font-black leading-[1.35] tracking-[-0.035em] !text-[#102b49]">
                    {item.title}
                  </h3>
                  <p className="mt-4 max-w-sm text-[11px] leading-7 !text-[#667985]">{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        data-manifesto
        className="relative overflow-hidden bg-[#102b49] px-5 py-20 text-[#fff4e3] md:px-10 md:py-28"
      >
        <div className="pointer-events-none absolute -bottom-32 -left-24 size-[420px] rounded-full border-[70px] border-[#78cbe9]/[0.055]" />
        <div className="relative mx-auto grid max-w-[1180px] gap-12 lg:grid-cols-[1.22fr_0.78fr] lg:items-end lg:gap-16">
          <div>
            <span className="text-[9px] font-bold tracking-[0.16em] !text-[#f3c744]" dir="ltr">
              WHY CHILD-SPECIFIC FIT MATTERS
            </span>
            <h2 className="mt-5 text-[clamp(43px,6.8vw,90px)] font-black leading-[0.99] tracking-[-0.065em] !text-[#fff4e3]">
              <span className="block overflow-hidden">
                <i data-manifesto-line className="block not-italic">پای کودک،</i>
              </span>
              <span className="block overflow-hidden">
                <i data-manifesto-line className="block not-italic !text-[#ff8179]">
                  نسخه کوچک پای بزرگسال نیست.
                </i>
              </span>
            </h2>
            <p className="mt-7 max-w-2xl text-[13px] leading-8 !text-[#c4d3dc]/80 md:text-[15px] md:leading-9">
              نسبت‌های پا در سال‌های رشد تغییر می‌کنند. به همین دلیل، کوچک‌کردن یک قالب بزرگسال
              پاسخ مناسبی برای کفش کودک نیست.
            </p>
          </div>

          <dl className="grid grid-cols-2 overflow-hidden rounded-[1.7rem] border border-white/10 bg-white/[0.035] p-4 lg:grid-cols-1 lg:p-5">
            <div className="border-b border-white/10 py-4 pl-4 lg:pl-0">
              <dt className="text-[9px] !text-[#91a8b6]">پنجه</dt>
              <dd className="mt-2 text-[15px] font-black !text-[#fff4e3] md:text-[17px]">فضای حرکت، بدون لقی</dd>
            </div>
            <div className="border-b border-white/10 py-4 pr-4 lg:pr-0">
              <dt className="text-[9px] !text-[#91a8b6]">پاشنه</dt>
              <dd className="mt-2 text-[15px] font-black !text-[#fff4e3] md:text-[17px]">ثبات، بدون فشار</dd>
            </div>
            <div className="col-span-2 py-4 lg:col-span-1">
              <dt className="text-[9px] !text-[#91a8b6]">زیره</dt>
              <dd className="mt-2 text-[15px] font-black !text-[#fff4e3] md:text-[17px]">انعطاف متناسب با حرکت پا</dd>
            </div>
          </dl>
        </div>
      </section>

      <section data-process className="bg-[#fffaf2] px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1180px] gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <span className="text-[9px] font-bold tracking-[0.16em] !text-[#e56862]" dir="ltr">
              PRODUCT DEVELOPMENT
            </span>
            <h2 className="mt-4 text-[clamp(39px,4.8vw,64px)] font-black leading-[1.06] tracking-[-0.055em] !text-[#102b49]">
              هر مدل، پیش از ویترین جواب پس می‌دهد.
            </h2>
            <p className="mt-5 max-w-sm text-[12px] leading-8 !text-[#667985] md:text-[13px]">
              هر مرحله باید به یک تصمیم روشن برسد: تأیید، اصلاح یا حذف. اگر نتیجه مشخص نباشد،
              فرایند هنوز تمام نشده است.
            </p>
          </div>

          <div className="border-t border-[#102b49]/15">
            {process.map(([number, title, description]) => (
              <article
                data-process-row
                key={number}
                className="group grid grid-cols-[44px_1fr] gap-x-4 gap-y-2 border-b border-[#102b49]/15 py-7 transition-colors hover:bg-[#f7f1e8]/65 md:grid-cols-[64px_0.55fr_1fr] md:items-center md:px-3 md:py-9"
              >
                <span className="text-[10px] font-black !text-[#e56862]" dir="ltr">{number}</span>
                <h3 className="text-[19px] font-black !text-[#102b49] transition-transform duration-300 group-hover:-translate-x-1 md:text-[22px]">
                  {title}
                </h3>
                <p className="col-start-2 text-[11px] leading-7 !text-[#667985] md:col-start-auto">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f1e8] px-4 py-14 md:px-8 md:py-20">
        <div
          data-about-cta
          className="mx-auto grid max-w-[1180px] gap-8 rounded-[2rem] bg-[#102b49] px-6 py-9 shadow-[0_24px_70px_rgba(16,43,73,0.13)] md:grid-cols-[1fr_auto] md:items-center md:px-10 md:py-11"
        >
          <div>
            <span className="text-[9px] font-black !text-[#f3c744]">انتخاب بر اساس نیاز واقعی</span>
            <h2 className="mt-3 max-w-[760px] text-[clamp(31px,4.2vw,54px)] font-black leading-[1.2] tracking-[-0.05em] !text-[#fff4e3]">
              کفشی را پیدا کن که پا‌به‌پای بازی می‌آید.
            </h2>
            <div className="mt-5 flex flex-wrap gap-5 text-[9px] !text-[#afc2cc]">
              <span className="flex items-center gap-2 [&>svg]:size-4 [&>svg]:text-[#f3c744]">
                <RefreshIcon />
                ۷ روز فرصت تعویض سایز
              </span>
              <span className="flex items-center gap-2 [&>svg]:size-4 [&>svg]:text-[#f3c744]">
                <ShieldIcon />
                راهنمای انتخاب پیش از خرید
              </span>
            </div>
          </div>

          <Link
            href="/shop"
            className="group inline-flex min-h-12 w-fit items-center gap-4 rounded-full bg-[#f3c744] px-6 text-[11px] font-black !text-[#102b49] transition hover:-translate-y-0.5 hover:bg-[#ffda58] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <span className="!text-[#102b49]">دیدن کفش‌ها</span>
            <span className="transition group-hover:-translate-x-1 [&>svg]:size-4 [&>svg]:text-[#102b49]">
              <ArrowLeftIcon />
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}