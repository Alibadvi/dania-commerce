import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeftIcon,
  RefreshIcon,
  RulerIcon,
  ShieldIcon,
  TruckIcon,
} from "@/components/icons";

const PRINCIPLES = [
  {
    number: "01",
    title: "پنجه‌ی جادار",
    description: "فضای کافی برای حرکت طبیعی و آزاد انگشت‌های کوچک.",
    note: "NATURAL FIT",
  },
  {
    number: "02",
    title: "زیره‌ی منعطف",
    description: "همراه با خم‌شدن پا؛ بدون محدودکردن مسیر حرکت.",
    note: "EASY FLEX",
  },
  {
    number: "03",
    title: "وزن کم",
    description: "سبک برای پوشیدن، دویدن و ادامه‌دادن بازی.",
    note: "LIGHT STEP",
  },
] as const;

const SERVICES = [
  {
    title: "ارسال سریع",
    description: "تهران، ۱ تا ۲ روز کاری",
    icon: TruckIcon,
    number: "01",
  },
  {
    title: "تعویض آسان",
    description: "تا ۷ روز پس از تحویل",
    icon: RefreshIcon,
    number: "02",
  },
  {
    title: "پرداخت امن",
    description: "از طریق درگاه رسمی بانکی",
    icon: ShieldIcon,
    number: "03",
  },
  {
    title: "مشاوره سایز",
    description: "پیش از نهایی‌کردن سفارش",
    icon: RulerIcon,
    number: "04",
  },
] as const;

export function DaniaStandard() {
  return (
    <section
      className="relative isolate overflow-hidden bg-[#0c2943] text-[#fff4e3] [font-family:inherit]"
      aria-labelledby="dania-standard-title"
      dir="rtl"
    >
      <div className="pointer-events-none absolute inset-0 -z-30 bg-[radial-gradient(circle_at_12%_25%,rgba(255,145,135,0.11),transparent_24%),radial-gradient(circle_at_83%_38%,rgba(71,171,218,0.13),transparent_28%),linear-gradient(180deg,#0c2943_0%,#0b263e_100%)]" />
      <div
        className="pointer-events-none absolute inset-0 -z-20 opacity-[0.045] [background-image:linear-gradient(rgba(255,255,255,.45)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.45)_1px,transparent_1px)] [background-size:48px_48px]"
        aria-hidden="true"
      />

      <span
        className="pointer-events-none absolute -left-[0.08em] top-12 -z-10 hidden select-none text-[clamp(150px,23vw,390px)] font-black leading-none tracking-[-0.11em] text-white/[0.025] lg:block"
        aria-hidden="true"
        dir="ltr"
      >
        03
      </span>

      <div className="mx-auto w-[min(1220px,calc(100%_-_2rem))] pb-16 pt-20 sm:pb-24 sm:pt-24 lg:pb-28 lg:pt-28">
        <div className="mb-10 flex items-center justify-between gap-6 border-b border-white/10 pb-5 text-[9px] font-bold tracking-[0.18em] text-[#afc4d1] sm:mb-14">
          <span className="flex items-center gap-3 text-[#f3c744]">
            <i className="size-1.5 rounded-full bg-current shadow-[0_0_16px_currentColor]" />
            DANIA / STANDARD
          </span>
          <span className="hidden sm:block" dir="ltr">
            FIT · FLEX · LIGHTNESS
          </span>
          <span className="text-[#fff4e3]/55" dir="ltr">
            03 / 03
          </span>
        </div>

        <div className="grid gap-14 lg:grid-cols-[1.04fr_0.96fr] lg:items-center lg:gap-20 xl:gap-24">
          <figure className="group/standard relative mx-auto w-full max-w-[650px] lg:mx-0">
            <span
              className="absolute -left-3 -top-3 size-24 rounded-tl-[2.8rem] border-l border-t border-[#f3c744]/65 sm:-left-5 sm:-top-5 sm:size-36"
              aria-hidden="true"
            />
            <span
              className="absolute -bottom-3 -right-3 size-20 rounded-br-[2.8rem] border-b border-r border-[#ff9187]/65 sm:-bottom-5 sm:-right-5 sm:size-28"
              aria-hidden="true"
            />

            <div className="relative aspect-[4/4.7] overflow-hidden rounded-[2rem] border border-white/10 bg-[#12334f] shadow-[0_42px_120px_rgba(0,7,24,0.38)] sm:rounded-[2.8rem] lg:aspect-[4/4.55]">
              <Image
                src="/images/danya-products.webp"
                alt="مجموعه‌ای از کفش‌های کودک دانیا"
                fill
                sizes="(max-width: 1023px) calc(100vw - 32px), 54vw"
                className="object-cover transition duration-1000 ease-[cubic-bezier(.16,1,.3,1)] group-hover/standard:scale-[1.025]"
              />

              <span
                className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,21,45,0.02)_30%,rgba(6,21,45,0.72)_100%)]"
                aria-hidden="true"
              />

              <div className="absolute inset-x-5 top-5 flex items-start justify-between sm:inset-x-7 sm:top-7">
                <span className="rounded-full border border-[#122844]/10 bg-[#fff8eb]/90 px-4 py-2 text-[9px] font-black text-[#122844] shadow-lg backdrop-blur-md">
                  مناسب حرکت روزانه
                </span>
                <span
                  className="grid size-12 place-items-center rounded-full border border-white/20 bg-[#0c2943]/65 text-[10px] font-black text-[#f3c744] backdrop-blur-md"
                  dir="ltr"
                >
                  03
                </span>
              </div>

              <figcaption className="absolute inset-x-4 bottom-4 rounded-[1.35rem] border border-white/15 bg-[#071a2d]/80 px-5 py-4 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:inset-x-6 sm:bottom-6 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:rounded-[1.6rem] sm:px-6 sm:py-5">
                <div>
                  <strong className="block text-[12px] font-extrabold !text-[#fff4e3]">
                    طراحی برای حرکت طبیعی
                  </strong>
                  <span className="mt-1 block text-[9px] leading-5 !text-[#b9ccd7]">
                    سه اصل ساده؛ برای راحتی واقعی در تمام روز
                  </span>
                </div>
                <span
                  className="mt-3 block shrink-0 text-[9px] font-black tracking-[0.18em] !text-[#f3c744] sm:mt-0"
                  dir="ltr"
                >
                  DANIA / 2026
                </span>
              </figcaption>
            </div>
          </figure>

          <div className="max-w-[590px] lg:py-6">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-[#f3c744]" aria-hidden="true" />
              <span className="text-[10px] font-black tracking-[0.04em] !text-[#f3c744]">
                استاندارد ساخت دانیا
              </span>
            </div>

            <h2
              id="dania-standard-title"
              className="mt-6 text-[clamp(42px,5.4vw,76px)] font-black leading-[1.08] tracking-[-0.055em] !text-[#fff4e3]"
            >
              جا برای رشد؛
              <br />
              <em className="font-[inherit] not-italic !text-[#ff9187]">
                آزادی برای حرکت.
              </em>
            </h2>

            <p className="mt-6 max-w-[540px] text-[13px] font-medium leading-8 !text-[#c5d5de]/75 sm:text-[14px] sm:leading-9">
              پای کودک نسخه‌ی کوچک پای بزرگسال نیست. برای همین هر کفش دانیا از فرم طبیعی پا شروع
              می‌شود؛ نه از ظاهر، نه از مد و نه از یک قالب تنگ و آماده.
            </p>

            <div className="mt-9 border-y border-white/10">
              {PRINCIPLES.map((principle) => (
                <article
                  key={principle.number}
                  className="group/principle relative grid grid-cols-[46px_1fr_auto] items-center gap-3 border-b border-white/10 py-5 last:border-b-0 sm:grid-cols-[54px_1fr_auto] sm:gap-5 sm:py-6"
                >
                  <span
                    className="grid size-9 place-items-center rounded-full border border-white/15 text-[9px] font-black !text-[#f3c744] transition duration-300 group-hover/principle:border-[#f3c744]/60 group-hover/principle:bg-[#f3c744]/10 sm:size-10"
                    dir="ltr"
                  >
                    {principle.number}
                  </span>

                  <div className="min-w-0">
                    <h3 className="text-[15px] font-extrabold !text-[#fff4e3] sm:text-[16px]">
                      {principle.title}
                    </h3>
                    <p className="mt-1.5 text-[10px] leading-6 !text-[#b9ccd7]/65 sm:text-[11px]">
                      {principle.description}
                    </p>
                  </div>

                  <span
                    className="hidden text-[8px] font-bold tracking-[0.15em] !text-[#89a5b5]/60 sm:block"
                    dir="ltr"
                  >
                    {principle.note}
                  </span>
                </article>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link
                href="/about"
                className="group/link inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#f3c744] px-6 text-[11px] font-black !text-[#102b45] shadow-[0_14px_36px_rgba(243,199,68,0.15)] transition hover:-translate-y-0.5 hover:bg-[#ffda58] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fff4e3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c2943]"
              >
                <span className="!text-[#102b45]">بیشتر درباره دانیا</span>
                <span className="transition group-hover/link:-translate-x-1 [&>svg]:size-3.5 [&>svg]:text-[#102b45]">
                  <ArrowLeftIcon />
                </span>
              </Link>

              <span className="text-[9px] font-bold tracking-[0.11em] !text-[#8ca7b6]" dir="ltr">
                MADE FOR LITTLE FEET
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative h-20 sm:h-28" aria-hidden="true">
        <div className="absolute -bottom-px left-1/2 h-full w-[118%] -translate-x-1/2 rounded-t-[50%] bg-[#f7f1e8] shadow-[0_-24px_70px_rgba(79,174,216,0.08)]" />
        <span className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap text-[8px] font-black tracking-[0.2em] !text-[#7d929e] sm:bottom-8" dir="ltr">
          CARE, FROM THE FIRST STEP
        </span>
      </div>

      <div className="relative bg-[#f7f1e8] pb-12 text-[#122844] sm:pb-16">
        <div className="mx-auto grid w-[min(1180px,calc(100%_-_2rem))] grid-cols-2 overflow-hidden rounded-[1.8rem] border border-[#122844]/10 bg-[#122844]/10 shadow-[0_24px_70px_rgba(18,40,68,0.08)] md:grid-cols-4">
          {SERVICES.map((service, index) => {
            const Icon = service.icon;

            return (
              <article
                key={service.title}
                className={`group/service relative flex min-h-32 items-center gap-3.5 bg-[#fffaf2] px-4 py-6 transition duration-300 hover:bg-white sm:min-h-36 sm:px-6 ${
                  index < 2 ? "border-b border-[#122844]/10 md:border-b-0" : ""
                } ${index % 2 === 0 ? "border-l border-[#122844]/10 md:border-l-0" : ""} ${
                  index > 0 ? "md:border-r md:border-[#122844]/10" : ""
                }`}
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-full border border-[#ef8176]/20 bg-[#ef8176]/10 transition group-hover/service:-translate-y-0.5 group-hover/service:bg-[#ef8176]/15 [&>svg]:size-5 [&>svg]:text-[#df7168]">
                  <Icon />
                </span>

                <span className="min-w-0">
                  <strong className="block text-[12px] font-black !text-[#122844] sm:text-[13px]">
                    {service.title}
                  </strong>
                  <small className="mt-1 block text-[9px] leading-5 !text-[#667985] sm:text-[10px]">
                    {service.description}
                  </small>
                </span>

                <span
                  className="absolute left-3 top-3 text-[8px] font-black tracking-[0.12em] !text-[#122844]/20 sm:left-4 sm:top-4"
                  dir="ltr"
                >
                  {service.number}
                </span>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}