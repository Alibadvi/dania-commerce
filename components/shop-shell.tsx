"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Product } from "@/lib/catalog";
import { formatPrice } from "@/lib/catalog";
import type { CartLine, CartOrder } from "@/lib/commerce-types";
import { BagIcon, CloseIcon, InstagramIcon, MenuIcon, UserIcon } from "@/components/icons";

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

export function ShopShell({ children, catalog }: { children: ReactNode; catalog: Product[] }) {
  const [order, setOrder] = useState<CartOrder | null>(null);
  const [cartBusy, setCartBusy] = useState(true);
  const [cartError, setCartError] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  return (
    <ShopContext.Provider value={value}>
      <header className="site-header">
        <div className="container header-inner">
          <button className="icon-button mobile-menu-button" aria-label="باز کردن منو" onClick={() => setMenuOpen(true)}><MenuIcon /></button>
          <Link href="/" className="brand" aria-label="دانیا، صفحه اصلی"><span className="brand-dot">d</span><span className="brand-word">DANIA</span><small>کفش کودک</small></Link>
          <nav className="main-nav" aria-label="منوی اصلی">
            <Link href="/shop?category=girl">دخترانه</Link><Link href="/shop?category=boy">پسرانه</Link><Link href="/about">درباره ما</Link><Link href="/contact">تماس با ما</Link>
          </nav>
          <div className="header-actions">
            <Link className="account-link" href="/account"><UserIcon /><span>ورود / عضویت</span></Link>
            <button className="cart-nav-button bag-button" aria-label="سبد خرید" onClick={() => setCartOpen(true)}><BagIcon /><span>سبد خرید</span>{value.cartCount > 0 && <b className="bag-count">{value.cartCount.toLocaleString("fa-IR")}</b>}</button>
          </div>
        </div>
      </header>

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

      <div className={`mobile-menu ${menuOpen ? "is-open" : ""}`} aria-hidden={!menuOpen} onMouseDown={(event) => { if (event.target === event.currentTarget) setMenuOpen(false); }}>
        <div className="mobile-menu-panel">
          <div className="mobile-menu-top"><Link href="/" className="brand" onClick={() => setMenuOpen(false)}><span className="brand-dot">d</span><span className="brand-word">DANIA</span></Link><button className="mobile-close" onClick={() => setMenuOpen(false)} aria-label="بستن منو"><CloseIcon /></button></div>
          <span className="mobile-menu-kicker">انتخاب مسیر</span>
          <nav onClickCapture={() => setMenuOpen(false)}><Link href="/shop?category=girl"><small>۰۱</small><span>دخترانه</span></Link><Link href="/shop?category=boy"><small>۰۲</small><span>پسرانه</span></Link><Link href="/about"><small>۰۳</small><span>درباره ما</span></Link><Link href="/contact"><small>۰۴</small><span>تماس با ما</span></Link></nav>
          <div className="mobile-menu-actions"><Link href="/account" onClick={() => setMenuOpen(false)}><UserIcon /><span><strong>ورود / عضویت</strong><small>حساب و سفارش‌های شما</small></span></Link><button onClick={() => { setMenuOpen(false); setCartOpen(true); }}><BagIcon /><span><strong>سبد خرید</strong><small>{value.cartCount ? `${value.cartCount.toLocaleString("fa-IR")} محصول` : "هنوز خالی است"}</small></span></button></div>
          <p className="mobile-menu-foot">DANIA — برای حرکت آزاد</p>
        </div>
      </div>
    </ShopContext.Provider>
  );
}

function EmptyCart({ close }: { close: () => void }) {
  return <div className="empty-cart"><span className="empty-cart-art"><BagIcon /></span><h3>سبدت هنوز خالیه</h3><p>یک جفت راحت برای ماجراجویی بعدی انتخاب کن.</p><Link href="/shop" className="button primary" onClick={close}>دیدن کفش‌ها</Link></div>;
}

function SiteFooter() {
  return <footer className="site-footer"><div className="container footer-grid"><div className="footer-brand"><Link href="/" className="brand light"><span className="brand-dot">d</span><span className="brand-word">DANIA</span></Link><p>برای قدم‌های کوچکی که<br/>دنیا را کشف می‌کنند.</p><a className="social-link" href="https://instagram.com/dania.kids" rel="noreferrer" target="_blank" aria-label="اینستاگرام دانیا"><InstagramIcon /> @dania.kids</a></div><div><h3>فروشگاه</h3><Link href="/shop?category=girl">دخترانه</Link><Link href="/shop?category=boy">پسرانه</Link></div><div><h3>دانیا</h3><Link href="/about">درباره ما</Link><Link href="/contact">تماس با ما</Link><Link href="/account">ورود / عضویت</Link></div><div className="footer-note"><h3>انتخاب مطمئن</h3><p>ارسال سریع، تعویض آسان و پشتیبانی برای انتخاب سایز درست.</p><Link className="footer-cta" href="/shop">دیدن کفش‌ها</Link></div></div><div className="container footer-bottom"><span>© ۱۴۰۵ دانیا — همه حقوق محفوظ است.</span><span>طراحی‌شده برای حرکت آزاد</span></div></footer>;
}
