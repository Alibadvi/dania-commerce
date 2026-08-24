"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Product } from "@/lib/catalog";
import { formatPrice } from "@/lib/catalog";
import type { CartLine, CartOrder, CustomerAccount } from "@/lib/commerce-types";
import { BagIcon, CloseIcon, InstagramIcon, UserIcon } from "@/components/icons";
import { DaniaWordmark } from "@/components/dania-wordmark";
import { IntroProvider } from "@/components/intro-context";
import { SiteLoader } from "@/components/site-loader";

type ShopContextValue = {
  catalog: Product[];
  cart: CartLine[];
  order: CartOrder | null;
  cartCount: number;
  cartBusy: boolean;
  cartError: string | null;
  addToCart: (productVariantId: string, quantity?: number) => Promise<void>;
  adjustCartLine: (orderLineId: string, quantity: number) => Promise<void>;
  removeFromCart: (orderLineId: string) => Promise<void>;
  applyCoupon: (couponCode: string) => Promise<void>;
  refreshCart: () => Promise<void>;
  replaceOrder: (order: CartOrder | null) => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
};

type ApiResponse = { order: CartOrder | null; error?: { message?: string } };
type AccountApiResponse = { customer: CustomerAccount | null; error?: { message?: string } };

const CUSTOMER_CHANGED_EVENT = "dania:customer-changed";

const ShopContext = createContext<ShopContextValue | null>(null);

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) throw new Error("useShop must be used inside ShopShell");
  return context;
}

async function commerceRequest(body?: Record<string, unknown>): Promise<ApiResponse> {
  const response = await fetch(body ? "/api/commerce" : "/api/commerce?resource=cart", {
    method: body ? "POST" : "GET",
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "same-origin",
    cache: "no-store",
  });
  const payload = await response.json() as ApiResponse;
  if (!response.ok) throw new Error(payload.error?.message ?? "درخواست فروشگاه انجام نشد.");
  return payload;
}

async function customerRequest(): Promise<AccountApiResponse> {
  const response = await fetch("/api/commerce?resource=account", {
    credentials: "same-origin",
    cache: "no-store",
  });
  const payload = await response.json() as AccountApiResponse;
  if (!response.ok) throw new Error(payload.error?.message ?? "درخواست حساب انجام نشد.");
  return payload;
}

export function ShopShell({ children, catalog }: { children: ReactNode; catalog: Product[] }) {
  const [order, setOrder] = useState<CartOrder | null>(null);
  const [cartBusy, setCartBusy] = useState(true);
  const [cartError, setCartError] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [introReady, setIntroReady] = useState(false);
  const [routeLoaderKey, setRouteLoaderKey] = useState(0);
  const [customer, setCustomer] = useState<CustomerAccount | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const reduceMotion = useReducedMotion();

  const runCartAction = useCallback(async (body?: Record<string, unknown>, openCart = false) => {
    setCartBusy(true);
    setCartError(null);
    try {
      const payload = await commerceRequest(body);
      setOrder(payload.order);
      if (openCart) setCartOpen(true);
    } catch (error) {
      setCartError(error instanceof Error ? error.message : "خطا در ارتباط با فروشگاه");
      if (openCart) setCartOpen(true);
      throw error;
    } finally {
      setCartBusy(false);
    }
  }, []);

  const refreshCart = useCallback(async () => {
    try {
      await runCartAction();
    } catch {
      // The visible error state is enough; a preview may intentionally run without Vendure.
    }
  }, [runCartAction]);

  useEffect(() => {
    let cancelled = false;
    commerceRequest()
      .then((payload) => { if (!cancelled) setOrder(payload.order); })
      .catch((error: unknown) => { if (!cancelled) setCartError(error instanceof Error ? error.message : "خطا در ارتباط با فروشگاه"); })
      .finally(() => { if (!cancelled) setCartBusy(false); });
    return () => { cancelled = true; };
  }, []);

  const refreshCustomer = useCallback(async () => {
    try {
      const payload = await customerRequest();
      setCustomer(payload.customer ?? null);
    } catch {
      setCustomer(null);
    }
  }, []);

  useEffect(() => {
    void refreshCustomer();
    const syncCustomer = () => void refreshCustomer();
    window.addEventListener(CUSTOMER_CHANGED_EVENT, syncCustomer);
    window.addEventListener("pageshow", syncCustomer);
    window.addEventListener("focus", syncCustomer);
    return () => {
      window.removeEventListener(CUSTOMER_CHANGED_EVENT, syncCustomer);
      window.removeEventListener("pageshow", syncCustomer);
      window.removeEventListener("focus", syncCustomer);
    };
  }, [refreshCustomer]);

  useEffect(() => {
    const updateHeader = () => setScrolled(window.scrollY > 18);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  useEffect(() => {
    const beginRouteTransition = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download") || anchor.dataset.loader === "false") return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      const current = new URL(window.location.href);
      const sameDocument = destination.pathname === current.pathname && destination.search === current.search;
      if (sameDocument) return;

      setRouteLoaderKey((key) => key + 1);
    };

    document.addEventListener("click", beginRouteTransition, true);
    return () => document.removeEventListener("click", beginRouteTransition, true);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const closeOnHistoryChange = () => setMenuOpen(false);
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("popstate", closeOnHistoryChange);
    window.addEventListener("hashchange", closeOnHistoryChange);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("popstate", closeOnHistoryChange);
      window.removeEventListener("hashchange", closeOnHistoryChange);
    };
  }, [menuOpen]);

  const value = useMemo<ShopContextValue>(() => ({
    catalog,
    cart: order?.lines ?? [],
    order,
    cartCount: order?.totalQuantity ?? 0,
    cartBusy,
    cartError,
    async addToCart(productVariantId, quantity = 1) {
      if (productVariantId.startsWith("demo-")) {
        const error = new Error("کاتالوگ زنده Vendure در دسترس نیست؛ سرویس فروشگاه را بررسی کنید.");
        setCartError(error.message);
        setCartOpen(true);
        throw error;
      }
      await runCartAction({ action: "cart.add", productVariantId, quantity }, true);
    },
    async adjustCartLine(orderLineId, quantity) {
      await runCartAction({ action: "cart.adjust", orderLineId, quantity });
    },
    async removeFromCart(orderLineId) {
      await runCartAction({ action: "cart.remove", orderLineId });
    },
    async applyCoupon(couponCode) {
      await runCartAction({ action: "cart.coupon", couponCode });
    },
    refreshCart,
    replaceOrder: setOrder,
    cartOpen,
    setCartOpen,
  }), [catalog, order, cartBusy, cartError, runCartAction, refreshCart, cartOpen]);

  const customerName = customer
    ? [customer.firstName, customer.lastName].map((part) => part?.trim()).filter(Boolean).join(" ") || customer.emailAddress.split("@")[0] || "دوست دانیا"
    : null;
  const customerFirstName = customer?.firstName?.trim() || customerName;
  const customerInitial = customerName?.slice(0, 1).toLocaleUpperCase("fa-IR") ?? "";

  return (
    <ShopContext.Provider value={value}>
      <IntroProvider ready={introReady}>
      <SiteLoader onComplete={() => setIntroReady(true)} />
      {routeLoaderKey > 0 && (
        <SiteLoader
          key={routeLoaderKey}
          mode="route"
          onComplete={() => setRouteLoaderKey(0)}
        />
      )}
      <motion.header
        className={`pointer-events-none sticky top-0 z-[80] border-0 transition-[background-color,box-shadow,backdrop-filter] duration-300 max-[980px]:bg-[rgba(251,248,241,.82)] max-[980px]:shadow-[0_1px_0_rgba(23,42,70,.08)] max-[980px]:backdrop-blur-2xl ${scrolled ? "bg-[rgba(251,248,241,.88)] shadow-[0_1px_0_rgba(23,42,70,.1)] backdrop-blur-2xl" : "bg-transparent"}`}
        initial={{ y: reduceMotion ? 0 : "-110%", opacity: reduceMotion ? 1 : 0 }}
        animate={introReady ? { y: 0, opacity: 1 } : { y: reduceMotion ? 0 : "-110%", opacity: reduceMotion ? 1 : 0 }}
        transition={{ duration: reduceMotion ? 0.18 : 0.82, delay: reduceMotion ? 0 : 0.08, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="pointer-events-auto mx-auto grid h-[92px] w-[min(calc(100%_-_56px),1380px)] grid-cols-[minmax(210px,1fr)_auto_minmax(270px,1fr)] items-center gap-[42px] text-[#172a46] max-[1160px]:w-[min(calc(100%_-_40px),1240px)] max-[1160px]:grid-cols-[minmax(170px,1fr)_auto_minmax(230px,1fr)] max-[1160px]:gap-7 max-[980px]:h-[76px] max-[980px]:w-[calc(100%_-_30px)] max-[980px]:grid-cols-[1fr_auto_1fr] max-[980px]:gap-3 max-[640px]:h-[68px] max-[640px]:w-[calc(100%_-_24px)]">
          <button
            className="hidden h-8 w-[42px] cursor-pointer place-items-center justify-self-start border-0 bg-transparent p-0 text-[#172a46] transition-colors hover:text-[#ff596f] max-[980px]:inline-grid"
            aria-label="باز کردن منو"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen(true)}
          >
            <span className="relative block h-5 w-8" aria-hidden="true"><i className="absolute right-0 top-[5px] h-0.5 w-7 rounded-full bg-current"/><i className="absolute bottom-[5px] right-0 h-0.5 w-[18px] rounded-full bg-current"/></span>
          </button>

          <Link href="/" className="brand !w-fit !min-w-0 !items-start !overflow-visible !border-0 !bg-transparent !p-0 !shadow-none max-[980px]:col-start-2 max-[980px]:justify-self-center [&_.dania-wordmark]:!w-[clamp(142px,11vw,176px)] max-[980px]:[&_.dania-wordmark]:!w-[132px] max-[640px]:[&_.dania-wordmark]:!w-[120px] [&>small]:!mt-0.5 [&>small]:!px-[3px] [&>small]:!text-[6px] [&>small]:!tracking-[3.1px] [&>small]:!text-[#172a46]/55 max-[980px]:[&>small]:!hidden" aria-label="دانیا، صفحه اصلی"><DaniaWordmark /><small>کفش کودک</small></Link>

          <nav className="flex items-center justify-self-center gap-[clamp(30px,4vw,62px)] max-[1160px]:gap-7 max-[980px]:hidden" aria-label="منوی اصلی">
            <Link className="group block h-[30px] overflow-hidden text-[clamp(12px,1vw,15px)] font-semibold leading-[30px]" href="/shop?category=girl"><small className="hidden">۰۱</small><span data-hover="دخترانه" className="relative inline-block leading-[30px] transition-transform duration-[420ms] ease-[cubic-bezier(.16,1,.3,1)] before:absolute before:right-0 before:top-full before:whitespace-nowrap before:text-[#ff596f] before:content-[attr(data-hover)] group-hover:-translate-y-full group-focus-visible:-translate-y-full">دخترانه</span></Link>
            <Link className="group block h-[30px] overflow-hidden text-[clamp(12px,1vw,15px)] font-semibold leading-[30px]" href="/shop?category=boy"><small className="hidden">۰۲</small><span data-hover="پسرانه" className="relative inline-block leading-[30px] transition-transform duration-[420ms] ease-[cubic-bezier(.16,1,.3,1)] before:absolute before:right-0 before:top-full before:whitespace-nowrap before:text-[#ff596f] before:content-[attr(data-hover)] group-hover:-translate-y-full group-focus-visible:-translate-y-full">پسرانه</span></Link>
            <Link className="group block h-[30px] overflow-hidden text-[clamp(12px,1vw,15px)] font-semibold leading-[30px]" href="/about"><small className="hidden">۰۳</small><span data-hover="درباره ما" className="relative inline-block leading-[30px] transition-transform duration-[420ms] ease-[cubic-bezier(.16,1,.3,1)] before:absolute before:right-0 before:top-full before:whitespace-nowrap before:text-[#ff596f] before:content-[attr(data-hover)] group-hover:-translate-y-full group-focus-visible:-translate-y-full">درباره ما</span></Link>
            <Link className="group block h-[30px] overflow-hidden text-[clamp(12px,1vw,15px)] font-semibold leading-[30px]" href="/contact"><small className="hidden">۰۴</small><span data-hover="تماس با ما" className="relative inline-block leading-[30px] transition-transform duration-[420ms] ease-[cubic-bezier(.16,1,.3,1)] before:absolute before:right-0 before:top-full before:whitespace-nowrap before:text-[#ff596f] before:content-[attr(data-hover)] group-hover:-translate-y-full group-focus-visible:-translate-y-full">تماس با ما</span></Link>
          </nav>

          <div className="flex items-center justify-end gap-[clamp(16px,2vw,30px)] [direction:rtl] max-[980px]:col-start-3 max-[980px]:gap-0 max-[980px]:justify-self-end">
            <Link className={`flex h-[34px] max-w-[190px] items-center gap-2 whitespace-nowrap text-[10px] font-extrabold transition-colors hover:text-[#ff596f] max-[980px]:hidden`} href="/account" aria-label={customerName ? `حساب ${customerName}` : "ورود یا عضویت"}>
              <span className={`grid size-[26px] shrink-0 place-items-center rounded-full border text-[9px] [&_svg]:size-[13px] ${customer ? "border-[#172a46] bg-[#172a46] text-white" : "border-[#172a46]/30 bg-transparent"}`} aria-hidden="true">{customerInitial || <UserIcon />}</span>
              <span className="flex min-w-0 flex-col items-start text-right"><small className="hidden">{customer ? "خوش اومدی" : "حساب دانیا"}</small><strong className="max-w-[118px] overflow-hidden text-ellipsis text-[10px] leading-none text-current">{customerName ?? "ورود / عضویت"}</strong></span>
            </Link>
            <button className="relative flex h-[34px] items-center gap-2 whitespace-nowrap border-0 bg-transparent p-0 text-[10px] font-extrabold text-[#172a46] transition-colors hover:text-[#ff596f] max-[980px]:h-[38px] max-[980px]:w-[42px] max-[980px]:justify-center" aria-label="سبد خرید" onClick={() => setCartOpen(true)}>
              <span className="grid size-[26px] place-items-center rounded-full border border-[#172a46]/30 [&_svg]:size-[13px] max-[980px]:size-[30px] max-[980px]:border-0 max-[980px]:[&_svg]:size-5"><BagIcon /></span><span className="flex flex-col items-start text-right max-[1160px]:hidden"><small className="hidden">انتخاب‌های من</small><strong className="text-[10px] leading-none">سبد خرید</strong></span>{value.cartCount > 0 && <b className="grid size-[21px] place-items-center rounded-full bg-[#ffd42f] text-[8px] text-[#172a46] max-[980px]:absolute max-[980px]:-right-[3px] max-[980px]:-top-px max-[980px]:size-[18px] max-[980px]:border-2 max-[980px]:border-[#fbf8f1]">{value.cartCount.toLocaleString("fa-IR")}</b>}
            </button>
          </div>
        </div>
      </motion.header>

      {children}
      <SiteFooter />

      <div className={`drawer-overlay ${cartOpen ? "is-open" : ""}`} onClick={() => setCartOpen(false)} />
      <aside className={`cart-drawer ${cartOpen ? "is-open" : ""} !w-[min(480px,100%)] !bg-[#fffaf0] !shadow-[24px_0_80px_rgba(4,17,34,.22)] [&_.drawer-heading]:!border-[#102b49]/10 [&_.drawer-heading]:!bg-white [&_.drawer-heading]:!px-6 [&_.drawer-heading]:!py-5 [&_.drawer-heading_h2]:!text-3xl [&_.drawer-body]:!px-6 [&_.cart-line]:!grid-cols-[88px_1fr_auto] [&_.cart-line]:!gap-4 [&_.cart-line]:!border-[#102b49]/10 [&_.cart-line]:!py-5 [&_.mini-product]:!h-[88px] [&_.mini-product]:!w-[88px] [&_.mini-product]:!rounded-2xl [&_.cart-line-info_strong]:!text-sm [&_.line-quantity]:!mt-1 [&_.line-quantity]:!w-fit [&_.line-quantity]:!rounded-full [&_.line-quantity]:!border [&_.line-quantity]:!border-[#102b49]/10 [&_.line-quantity_button]:!size-7 [&_.remove-line]:!rounded-full [&_.remove-line]:!bg-[#ff6b68]/10 [&_.remove-line]:!px-2.5 [&_.remove-line]:!py-1.5 [&_.remove-line]:!text-[#b13f43] [&_.drawer-footer]:!border-[#102b49]/10 [&_.drawer-footer]:!bg-white [&_.drawer-footer]:!px-6 [&_.drawer-footer]:!py-5 [&_.drawer-total_strong]:!text-base [&_.drawer-footer_.button]:!min-h-12 [&_.drawer-footer_.button]:!rounded-full [&_.drawer-footer_.button]:!bg-[#102b49]`} aria-hidden={!cartOpen} aria-busy={cartBusy}>
        <div className="drawer-heading"><div><span className="eyebrow">انتخاب‌های شما</span><h2>سبد خرید</h2></div><button className="icon-button" onClick={() => setCartOpen(false)} aria-label="بستن"><CloseIcon /></button></div>
        {cartError && <div className="commerce-alert" role="alert">{cartError}</div>}
        <div className="drawer-body">
          {cartBusy && !order ? <div className="cart-loading">در حال همگام‌سازی سبد…</div> : value.cart.length === 0 ? <EmptyCart close={() => setCartOpen(false)} /> : value.cart.map((line) => (
            <div className="cart-line" key={line.id}>
              <Link href={`/product/${line.productSlug}`} className={`mini-product product-image ${line.imagePosition}`} aria-label={line.productName} />
              <div className="cart-line-info">
                <strong>{line.productName}</strong>
                <span>سایز {line.size.toLocaleString("fa-IR")}</span>
                <div className="line-quantity" aria-label="تعداد محصول">
                  <button disabled={cartBusy} onClick={() => void value.adjustCartLine(line.id, Math.max(0, line.quantity - 1))} aria-label="کم کردن تعداد">−</button>
                  <span>{line.quantity.toLocaleString("fa-IR")}</span>
                  <button disabled={cartBusy || line.quantity >= 20} onClick={() => void value.adjustCartLine(line.id, line.quantity + 1)} aria-label="زیاد کردن تعداد">+</button>
                </div>
                <b>{formatPrice(line.linePrice)} <small>تومان</small></b>
              </div>
              <button className="remove-line" disabled={cartBusy} onClick={() => void value.removeFromCart(line.id)}>حذف</button>
            </div>
          ))}
        </div>
        {value.cart.length > 0 && <div className="drawer-footer"><div className="drawer-total"><span>جمع سبد</span><strong>{formatPrice(order?.subTotal ?? 0)} تومان</strong></div><Link href="/checkout" className="button primary wide" onClick={() => setCartOpen(false)}>ادامه و ثبت سفارش</Link><span className="secure-note">اطلاعات سفارش با اتصال امن ثبت می‌شود</span></div>}
      </aside>

      <div id="mobile-navigation" className={`mobile-menu ${menuOpen ? "is-open" : ""}`} role="dialog" aria-modal="true" aria-label="منوی دانیا" aria-hidden={!menuOpen} onMouseDown={(event) => { if (event.target === event.currentTarget) setMenuOpen(false); }}>
        <div className="mobile-menu-panel">
          <div className="mobile-menu-top"><Link href="/" className="brand mobile-brand-plate" aria-label="دانیا، صفحه اصلی" onClick={() => setMenuOpen(false)}><DaniaWordmark /></Link><button className="mobile-close" onClick={() => setMenuOpen(false)} aria-label="بستن منو"><span className="hamburger-glyph close-glyph" aria-hidden="true"><i /><i /></span></button></div>
          <Link className={`mobile-member-card${customer ? " is-authenticated" : ""}`} href="/account" onClick={() => setMenuOpen(false)}>
            <span className="mobile-member-avatar" aria-hidden="true">{customerInitial || <UserIcon />}</span>
            <span className="mobile-member-copy"><small>{customer ? "عضو خانواده دانیا" : "حساب شخصی دانیا"}</small><strong>{customer ? `سلام ${customerFirstName}` : "ورود / ساخت حساب"}</strong><em>{customer ? "سفارش‌ها و مشخصاتت اینجاست" : "خرید سریع‌تر و پیگیری سفارش‌ها"}</em></span>
            <span className="mobile-member-arrow" aria-hidden="true">↙</span>
          </Link>
          <div className="mobile-menu-kicker"><span>COLLECTION</span><b>۰۱ — ۰۴</b></div>
          <nav onClickCapture={() => setMenuOpen(false)}><Link href="/shop?category=girl"><small>۰۱</small><span><strong>دخترانه</strong><em>رنگ، بازی، حرکت</em></span></Link><Link href="/shop?category=boy"><small>۰۲</small><span><strong>پسرانه</strong><em>سبک برای ماجراجویی</em></span></Link><Link href="/about"><small>۰۳</small><span><strong>درباره ما</strong><em>قصه‌ی قدم‌های کوچک</em></span></Link><Link href="/contact"><small>۰۴</small><span><strong>تماس با ما</strong><em>کنارت هستیم</em></span></Link></nav>
          <div className="mobile-menu-actions"><button onClick={() => { setMenuOpen(false); setCartOpen(true); }}><span className="mobile-cart-icon"><BagIcon /></span><span><small>سبد دانیا</small><strong>{value.cartCount ? `${value.cartCount.toLocaleString("fa-IR")} انتخاب برای کوچولوت` : "هنوز منتظر اولین انتخابه"}</strong></span><b>{value.cartCount.toLocaleString("fa-IR")}</b></button></div>
          <p className="mobile-menu-foot"><span>DANIA KIDS</span><b>برای حرکت آزاد</b></p>
        </div>
      </div>
      </IntroProvider>
    </ShopContext.Provider>
  );
}

function EmptyCart({ close }: { close: () => void }) {
  return <div className="empty-cart"><span className="empty-cart-art"><BagIcon /></span><h3>سبدت هنوز خالیه</h3><p>یک جفت راحت برای ماجراجویی بعدی انتخاب کن.</p><Link href="/shop" className="button primary" onClick={close}>دیدن کفش‌ها</Link></div>;
}

function SiteFooter() {
  const footerLinkClass = "block w-fit py-1.5 text-xs text-slate-300 transition-colors hover:text-white focus-visible:text-white";

  return <footer className="border-t border-white/10 bg-[#0b1d33] px-4 text-white sm:px-6">
    <div className="mx-auto grid max-w-[1180px] gap-10 py-12 md:grid-cols-[1.1fr_.8fr_.9fr_1.2fr] md:gap-8 md:py-14">
      <div className="[&_.brand-word]:!text-white">
        <Link href="/" className="brand light !justify-start"><DaniaWordmark /></Link>
        <p className="mt-5 max-w-60 text-xs leading-6 text-slate-300">فروشگاه تخصصی کفش کودک؛ انتخاب‌های سبک، راحت و مناسب حرکت آزاد.</p>
        <a className="mt-5 flex w-fit items-center gap-2 text-xs text-white" href="https://instagram.com/dania.kids" rel="noreferrer" target="_blank" aria-label="اینستاگرام دانیا"><InstagramIcon /> <span dir="ltr">@dania.kids</span></a>
      </div>

      <nav aria-label="دسترسی سریع">
        <h2 className="mb-3 text-xs font-black text-[#ffc83e]">دسترسی سریع</h2>
        <Link className={footerLinkClass} href="/shop?category=girl">کفش دخترانه</Link><Link className={footerLinkClass} href="/shop?category=boy">کفش پسرانه</Link><Link className={footerLinkClass} href="/about">درباره دانیا</Link><Link className={footerLinkClass} href="/contact">تماس با ما</Link>
      </nav>

      <nav aria-label="خدمات مشتریان">
        <h2 className="mb-3 text-xs font-black text-[#ffc83e]">خدمات مشتریان</h2>
        <Link className={footerLinkClass} href="/account">پیگیری سفارش</Link><Link className={footerLinkClass} href="/contact">راهنمای انتخاب سایز</Link><Link className={footerLinkClass} href="/contact">شرایط تعویض و بازگشت</Link><Link className={footerLinkClass} href="/contact">پرسش‌های متداول</Link>
      </nav>

      <section aria-labelledby="footer-contact-title">
        <h2 id="footer-contact-title" className="mb-3 text-xs font-black text-[#ffc83e]">ارتباط با دانیا</h2>
        <address className="not-italic text-xs leading-6 text-slate-300">
          <p><span className="block text-[10px] text-slate-500">نشانی فروشگاه</span>تهران — نشانی ثبتی فروشگاه پس از نهایی‌شدن درج می‌شود.</p>
          <p className="mt-3"><span className="block text-[10px] text-slate-500">ایمیل پشتیبانی</span><a className="text-white hover:text-[#ffc83e]" dir="ltr" href="mailto:hello@dania.ir">hello@dania.ir</a></p>
          <p className="mt-3"><span className="block text-[10px] text-slate-500">ساعات پاسخگویی</span>شنبه تا پنجشنبه، ۹ تا ۱۸</p>
        </address>
      </section>
    </div>

    <div className="mx-auto flex max-w-[1180px] flex-col gap-6 border-t border-white/10 py-7 md:flex-row md:items-center md:justify-between">
      <div><h2 className="text-xs font-black">مجوزها و نشان‌های اعتماد</h2><p className="mt-1 text-[10px] text-slate-500">نشان‌ها پس از صدور رسمی در این بخش فعال می‌شوند.</p></div>
      <div className="flex flex-wrap gap-3" aria-label="جایگاه نشان‌های اعتماد">
        <div data-trust-badge="enamad" className="grid h-20 w-20 place-items-center rounded-xl border border-white/15 bg-white/[.06] p-2 text-center"><span className="text-[10px] leading-4 text-slate-300">نماد اعتماد<br/><b className="text-white">eNamad</b></span></div>
        <div data-trust-badge="samandehi" className="grid h-20 w-20 place-items-center rounded-xl border border-white/15 bg-white/[.06] p-2 text-center"><span className="text-[10px] leading-4 text-slate-300">نشان<br/><b className="text-white">ساماندهی</b></span></div>
        <div data-trust-badge="trade" className="grid h-20 w-20 place-items-center rounded-xl border border-dashed border-white/20 bg-white/[.03] p-2 text-center"><span className="text-[10px] leading-4 text-slate-500">محل نشان<br/>تکمیلی</span></div>
      </div>
    </div>

    <div className="mx-auto flex max-w-[1180px] flex-col gap-2 border-t border-white/10 py-5 text-[9px] text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>© ۱۴۰۵ دانیا — همه حقوق محفوظ است.</span><div className="flex gap-5"><Link className="hover:text-white" href="/contact">حریم خصوصی</Link><Link className="hover:text-white" href="/contact">قوانین و مقررات</Link></div></div>
  </footer>;
}
