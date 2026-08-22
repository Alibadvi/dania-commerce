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
        className={`site-header${scrolled ? " is-scrolled" : ""}`}
        initial={{ y: reduceMotion ? 0 : "-110%", opacity: reduceMotion ? 1 : 0 }}
        animate={introReady ? { y: 0, opacity: 1 } : { y: reduceMotion ? 0 : "-110%", opacity: reduceMotion ? 1 : 0 }}
        transition={{ duration: reduceMotion ? 0.18 : 0.82, delay: reduceMotion ? 0 : 0.08, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="container header-inner">
          <button
            className={`icon-button mobile-menu-button${menuOpen ? " is-active" : ""}`}
            aria-label="باز کردن منو"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen(true)}
          >
            <span className="hamburger-glyph" aria-hidden="true"><i /><i /></span>
            <span className="mobile-menu-label">منو</span>
          </button>
          <Link href="/" className="brand header-brand" aria-label="دانیا، صفحه اصلی"><DaniaWordmark /><small>کفش کودک</small></Link>
          <nav className="main-nav" aria-label="منوی اصلی">
            <Link href="/shop?category=girl"><small>۰۱</small><span data-hover="دخترانه">دخترانه</span></Link><Link href="/shop?category=boy"><small>۰۲</small><span data-hover="پسرانه">پسرانه</span></Link><Link href="/about"><small>۰۳</small><span data-hover="درباره ما">درباره ما</span></Link><Link href="/contact"><small>۰۴</small><span data-hover="تماس با ما">تماس با ما</span></Link>
          </nav>
          <div className="header-actions">
            <Link className={`account-link${customer ? " is-authenticated" : ""}`} href="/account" aria-label={customerName ? `حساب ${customerName}` : "ورود یا عضویت"}>
              <span className="nav-account-avatar" aria-hidden="true">{customerInitial || <UserIcon />}</span>
              <span className="nav-account-copy"><small>{customer ? "خوش اومدی" : "حساب دانیا"}</small><strong>{customerName ?? "ورود / عضویت"}</strong></span>
            </Link>
            <button className="cart-nav-button bag-button" aria-label="سبد خرید" onClick={() => setCartOpen(true)}>
              <span className="nav-cart-icon"><BagIcon /></span><span className="nav-cart-copy"><small>انتخاب‌های من</small><strong>سبد خرید</strong></span>{value.cartCount > 0 && <b className="bag-count">{value.cartCount.toLocaleString("fa-IR")}</b>}
            </button>
          </div>
        </div>
      </motion.header>

      {children}
      <SiteFooter />

      <div className={`drawer-overlay ${cartOpen ? "is-open" : ""}`} onClick={() => setCartOpen(false)} />
      <aside className={`cart-drawer ${cartOpen ? "is-open" : ""}`} aria-hidden={!cartOpen} aria-busy={cartBusy}>
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
  return <footer className="site-footer"><div className="container footer-grid"><div className="footer-brand"><Link href="/" className="brand light"><DaniaWordmark /></Link><p>برای قدم‌های کوچکی که<br/>دنیا را کشف می‌کنند.</p><a className="social-link" href="https://instagram.com/dania.kids" rel="noreferrer" target="_blank" aria-label="اینستاگرام دانیا"><InstagramIcon /> @dania.kids</a></div><div><h3>فروشگاه</h3><Link href="/shop?category=girl">دخترانه</Link><Link href="/shop?category=boy">پسرانه</Link></div><div><h3>دانیا</h3><Link href="/about">درباره ما</Link><Link href="/contact">تماس با ما</Link><Link href="/account">ورود / عضویت</Link></div><div className="footer-note"><h3>انتخاب مطمئن</h3><p>ارسال سریع، تعویض آسان و پشتیبانی برای انتخاب سایز درست.</p><Link className="footer-cta" href="/shop">دیدن کفش‌ها</Link></div></div><div className="container footer-bottom"><span>© ۱۴۰۵ دانیا — همه حقوق محفوظ است.</span><span>طراحی‌شده برای حرکت آزاد</span></div></footer>;
}
