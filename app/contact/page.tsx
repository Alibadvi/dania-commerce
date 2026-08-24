import type { Metadata } from "next";
import Link from "next/link";
import { InstagramIcon, ShieldIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "تماس با دانیا | پشتیبانی سفارش و انتخاب سایز",
  description:
    "ارتباط مستقیم با پشتیبانی دانیا برای راهنمایی انتخاب سایز، پیگیری سفارش و درخواست تعویض کفش کودک.",
  alternates: { canonical: "/contact" },
};

const PERSIAN_FONT_STACK =
  '"Vazirmatn Variable", Vazirmatn, Tahoma, Arial, sans-serif';

const SUPPORT_PATHS = [
  {
    number: "۰۱",
    label: "ORDER",
    title: "پیگیری سفارش",
    description: "وضعیت آماده‌سازی و ارسال سفارشت را از حساب کاربری دنبال کن.",
    action: "مشاهده سفارش‌ها",
    href: "/account",
  },
  {
    number: "۰۲",
    label: "SIZE",
    title: "راهنمای انتخاب سایز",
    description: "طول پا و مدل موردنظرت را بفرست تا دقیق‌تر راهنمایی‌ات کنیم.",
    action: "دریافت راهنمایی",
    href: "mailto:hello@dania.ir?subject=راهنمای انتخاب سایز",
  },
  {
    number: "۰۳",
    label: "EXCHANGE",
    title: "تعویض کالا",
    description: "شماره سفارش و دلیل تعویض را بفرست تا درخواستت بررسی شود.",
    action: "ثبت درخواست تعویض",
    href: "mailto:hello@dania.ir?subject=درخواست تعویض سفارش",
  },
] as const;

export default function ContactPage() {
  return (
    <main
      className="overflow-hidden bg-[#f7f1e8] text-[#122844]"
      dir="rtl"
      style={{ fontFamily: PERSIAN_FONT_STACK }}
    >
      <section className="relative isolate overflow-hidden bg-[#081b31] px-4 pb-16 pt-14 text-[#fff4e3] sm:px-6 md:pb-24 md:pt-20 lg:px-8">
        <div
          className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_14%_22%,rgba(255,126,118,.16),transparent_26%),radial-gradient(circle_at_82%_70%,rgba(74,148,220,.15),transparent_30%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-10 -left-8 -z-10 select-none font-sans text-[clamp(120px,25vw,390px)] font-black leading-none tracking-[-.1em] text-white/[.025]"
          dir="ltr"
          aria-hidden="true"
        >
          HELLO
        </div>

        <div className="mx-auto grid w-full max-w-[1180px] gap-12 lg:grid-cols-[1.08fr_.92fr] lg:items-end lg:gap-20">
          <div className="max-w-[680px]">
            <div className="flex items-center gap-3 text-[10px] font-black text-[#f5c542]">
              <span className="h-px w-10 bg-current" aria-hidden="true" />
              <span>پشتیبانی دانیا</span>
            </div>

            <h1 className="mt-7 text-[clamp(46px,7vw,92px)] font-black leading-[1.04] tracking-[-.065em]">
              یک پیام تا
              <br />
              <span className="text-[#ff9187]">جواب درست.</span>
            </h1>

            <p className="mt-7 max-w-[560px] text-[13px] leading-8 text-[#c6d5df] sm:text-sm">
              برای انتخاب سایز، پیگیری سفارش یا تعویض کالا مستقیم با تیم دانیا صحبت کن؛
              بدون فرم‌های طولانی و پاسخ‌های آماده.
            </p>

            <div className="mt-9 flex flex-wrap gap-2.5 text-[10px] font-bold text-[#dce7ed]">
              <span className="rounded-full border border-white/10 bg-white/[.045] px-4 py-2.5">
                راهنمایی پیش از خرید
              </span>
              <span className="rounded-full border border-white/10 bg-white/[.045] px-4 py-2.5">
                پیگیری پس از سفارش
              </span>
              <span className="rounded-full border border-white/10 bg-white/[.045] px-4 py-2.5">
                پاسخ انسانی
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[.055] p-2 shadow-[0_30px_90px_rgba(0,7,24,.28)] backdrop-blur-xl sm:rounded-[34px]">
            <a
              href="mailto:hello@dania.ir"
              className="group flex min-h-[104px] items-center justify-between gap-5 rounded-[22px] px-5 transition hover:bg-white/[.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542] sm:px-6"
            >
              <span>
                <small className="block text-[9px] font-bold text-[#95aabd]">
                  ایمیل پشتیبانی
                </small>
                <strong className="mt-2 block font-sans text-[17px] tracking-[-.02em] text-white sm:text-lg" dir="ltr">
                  hello@dania.ir
                </strong>
              </span>
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#f5c542] text-lg text-[#122844] transition duration-300 group-hover:-translate-x-1" aria-hidden="true">
                ←
              </span>
            </a>

            <div className="mx-4 h-px bg-white/10" aria-hidden="true" />

            <a
              href="https://instagram.com/dania.kids"
              target="_blank"
              rel="noreferrer"
              className="group flex min-h-[104px] items-center justify-between gap-5 rounded-[22px] px-5 transition hover:bg-white/[.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542] sm:px-6"
            >
              <span>
                <small className="block text-[9px] font-bold text-[#95aabd]">
                  پاسخ سریع در اینستاگرام
                </small>
                <strong className="mt-2 flex items-center gap-2.5 text-[17px] text-white sm:text-lg">
                  <span className="grid size-5 place-items-center [&>svg]:size-full">
                    <InstagramIcon />
                  </span>
                  <span className="font-sans" dir="ltr">@dania.kids</span>
                </strong>
              </span>
              <span className="grid size-10 shrink-0 place-items-center rounded-full border border-white/15 text-lg text-[#f5c542] transition duration-300 group-hover:-translate-x-1 group-hover:bg-white/[.06]" aria-hidden="true">
                ←
              </span>
            </a>

            <div className="mx-4 h-px bg-white/10" aria-hidden="true" />

            <div className="flex min-h-[92px] items-center justify-between gap-5 px-5 sm:px-6">
              <span>
                <small className="block text-[9px] font-bold text-[#95aabd]">
                  ساعات پاسخ‌گویی
                </small>
                <strong className="mt-2 block text-[13px] text-white">
                  شنبه تا پنجشنبه، ۹ تا ۱۸
                </strong>
              </span>
              <span className="flex items-center gap-2 text-[9px] font-bold text-emerald-300">
                <i className="size-2 rounded-full bg-emerald-400 shadow-[0_0_0_5px_rgba(52,211,153,.12)]" aria-hidden="true" />
                پاسخ‌گو هستیم
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="text-[10px] font-black text-[#ef8176]">موقعیت دانیا</span>
              <h2 className="mt-3 text-[clamp(28px,4vw,44px)] font-black tracking-[-.045em]">
                برای مراجعه، اول هماهنگ کنیم.
              </h2>
            </div>
            <p className="max-w-md text-[11px] leading-7 text-[#637483] sm:text-xs">
              موقعیت روی نقشه تقریبی است. نشانی دقیق مراجعه پس از هماهنگی با پشتیبانی ارسال می‌شود.
            </p>
          </div>

          <div className="grid overflow-hidden rounded-[30px] border border-[#122844]/10 bg-white shadow-[0_30px_80px_rgba(18,40,68,.13)] md:rounded-[42px] lg:grid-cols-[360px_minmax(0,1fr)]">
            <div className="relative isolate flex flex-col justify-between overflow-hidden bg-[#0b223c] p-7 text-[#fff4e3] sm:p-9 lg:min-h-[540px]">
              <div
                className="pointer-events-none absolute -bottom-16 -right-16 -z-10 size-64 rounded-full bg-[#315dff]/15 blur-3xl"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute -left-20 -top-20 -z-10 size-56 rounded-full bg-[#ff9187]/15 blur-3xl"
                aria-hidden="true"
              />

              <div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[9px] font-black text-[#ff9187]">محدوده مراجعه</span>
                  <span className="rounded-full border border-[#f5c542]/20 bg-[#f5c542]/10 px-3 py-1.5 text-[9px] font-black text-[#f5c542]">
                    موقعیت تقریبی
                  </span>
                </div>

                <h3 className="mt-7 text-[26px] font-black leading-[1.35] tracking-[-.035em]">
                  تهران،
                  <br />
                  موقعیت دفتر دانیا
                </h3>
                <p className="mt-5 text-[11px] leading-7 text-[#b9cad6]">
                  مراجعه حضوری فقط با هماهنگی قبلی انجام می‌شود. نشانی دقیق را پیش از مراجعه از پشتیبانی دریافت کن.
                </p>
              </div>

              <div className="mt-9 border-t border-white/10 pt-6">
                <div className="flex items-center justify-between gap-4 text-[10px]">
                  <span className="text-[#8fa6b7]">پاسخ‌گویی</span>
                  <strong className="text-white">شنبه تا پنجشنبه، ۹ تا ۱۸</strong>
                </div>

                <div className="mt-6 grid gap-2.5">
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=35.78046766967264,51.373698846813454"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#f5c542] px-5 text-[10px] font-black !text-[#122844] transition hover:-translate-y-0.5 hover:bg-[#ffd45d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    باز کردن در Google Maps
                    <span aria-hidden="true">↗</span>
                  </a>
                  <a
                    href="mailto:hello@dania.ir?subject=هماهنگی مراجعه حضوری"
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-white/[.05] px-5 text-[10px] font-black !text-[#fff4e3] transition hover:bg-white/[.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]"
                  >
                    هماهنگی مراجعه
                  </a>
                </div>
              </div>
            </div>

            <div className="relative min-h-[430px] bg-[#e7e9e8] sm:min-h-[500px] lg:min-h-[540px]">
              <iframe
                title="نقشه گوگل محدوده دانیا در تهران"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d809.1981804913033!2d51.373698846813454!3d35.78046766967264!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3f8e07c6b01336eb%3A0xda87903321aaf30c!2sPetro%20Sanat%20Sapra%20Co.!5e0!3m2!1sen!2s!4v1787528652479!5m2!1sen!2s"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                className="absolute inset-0 h-full w-full border-0"
                allowFullScreen
              />
              <span className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/80 bg-white/90 px-3.5 py-2 font-sans text-[9px] font-bold tracking-[.08em] text-[#122844] shadow-sm backdrop-blur-md" dir="ltr">
                GOOGLE MAPS
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#122844]/10 bg-[#fffaf2] px-4 py-16 sm:px-6 md:py-20 lg:px-8">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-9 flex items-end justify-between gap-6">
            <div>
              <span className="text-[10px] font-black text-[#ef8176]">راه سریع‌تر</span>
              <h2 className="mt-3 text-3xl font-black tracking-[-.04em] sm:text-4xl">
                موضوع پیامت چیست؟
              </h2>
            </div>
            <span className="hidden font-sans text-[10px] font-bold tracking-[.16em] text-[#122844]/30 md:block" dir="ltr">
              SELECT A TOPIC / 03
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {SUPPORT_PATHS.map((item) => {
              const content = (
                <>
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-sans text-[10px] font-black tracking-[.12em] text-[#ef8176]" dir="ltr">
                      {item.label}
                    </span>
                    <span className="text-[11px] font-black text-[#122844]/25">
                      {item.number}
                    </span>
                  </div>
                  <h3 className="mt-10 text-xl font-black sm:text-2xl">{item.title}</h3>
                  <p className="mt-3 min-h-14 text-[11px] leading-7 text-[#687785]">
                    {item.description}
                  </p>
                  <span className="mt-8 inline-flex items-center gap-2 text-[10px] font-black text-[#315dff]">
                    {item.action}
                    <b className="text-base font-normal transition-transform duration-300 group-hover:-translate-x-1" aria-hidden="true">←</b>
                  </span>
                </>
              );

              const className =
                "group min-h-[270px] rounded-[26px] border border-[#122844]/10 bg-white p-6 shadow-[0_14px_45px_rgba(18,40,68,.055)] transition duration-300 hover:-translate-y-1 hover:border-[#ef8176]/35 hover:shadow-[0_22px_55px_rgba(18,40,68,.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef8176] sm:p-7";

              return item.href.startsWith("/") ? (
                <Link key={item.label} href={item.href} className={className}>
                  {content}
                </Link>
              ) : (
                <a key={item.label} href={item.href} className={className}>
                  {content}
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-7 overflow-hidden rounded-[28px] bg-[#f5c542] p-7 shadow-[0_18px_55px_rgba(121,88,0,.12)] sm:rounded-[34px] md:flex-row md:items-center md:justify-between md:p-10">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#122844] text-[#fff4e3] [&>svg]:size-6">
              <ShieldIcon />
            </span>
            <div>
              <h2 className="text-lg font-black sm:text-xl">جواب سریع‌تر، با اطلاعات کامل‌تر.</h2>
              <p className="mt-2 max-w-xl text-[11px] leading-7 text-[#3f5266] sm:text-xs">
                شماره سفارش، نام خریدار، مدل محصول و سایز موردنظر را همراه پیامت بفرست.
              </p>
            </div>
          </div>
          <a
            href="mailto:hello@dania.ir"
            className="inline-flex min-h-12 w-fit shrink-0 items-center justify-center gap-3 rounded-full bg-[#122844] px-6 text-[11px] font-black !text-[#fff4e3] transition hover:-translate-y-0.5 hover:bg-[#1f4a73] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#122844]/40"
          >
            ارسال ایمیل
            <span className="!text-[#f5c542]" aria-hidden="true">←</span>
          </a>
        </div>
      </section>
    </main>
  );
}