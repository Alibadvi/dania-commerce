"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { products, type Product, formatPrice } from "@/lib/catalog";
import { BagIcon, CloseIcon, InstagramIcon, MenuIcon, SearchIcon, UserIcon } from "@/components/icons";

type CartLine = { productId: string; quantity: number; size: number };
type ShopContextValue = {
  cart: CartLine[];
  cartCount: number;
  addToCart: (productId: string, size?: number) => void;
  removeFromCart: (productId: string) => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
};

const ShopContext = createContext<ShopContextValue | null>(null);

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) throw new Error("useShop must be used inside ShopShell");
  return context;
}

export function ShopShell({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem("danya-cart");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as CartLine[];
        const timer = window.setTimeout(() => setCart(parsed), 0);
        return () => window.clearTimeout(timer);
      } catch { /* ignore invalid local data */ }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("danya-cart", JSON.stringify(cart));
  }, [cart]);

  const value = useMemo<ShopContextValue>(() => ({
    cart,
    cartCount: cart.reduce((sum, item) => sum + item.quantity, 0),
    addToCart(productId, size) {
      const product = products.find((item) => item.id === productId);
      if (!product) return;
      const chosenSize = size ?? product.sizes[0];
      setCart((current) => {
        const existing = current.find((item) => item.productId === productId && item.size === chosenSize);
        if (existing) return current.map((item) => item === existing ? { ...item, quantity: item.quantity + 1 } : item);
        return [...current, { productId, size: chosenSize, quantity: 1 }];
      });
      setCartOpen(true);
    },
    removeFromCart(productId) {
      setCart((current) => current.filter((item) => item.productId !== productId));
    },
    cartOpen,
    setCartOpen,
  }), [cart, cartOpen]);

  const results = search.trim()
    ? products.filter((product) => `${product.name} ${product.subtitle} ${product.category}`.includes(search.trim()))
    : products.slice(0, 4);

  return (
    <ShopContext.Provider value={value}>
      <div className="announcement">ارسال رایگان برای خریدهای بالای ۲ میلیون تومان <span>•</span> تعویض سایز تا ۷ روز</div>
      <header className="site-header">
        <div className="container header-inner">
          <button className="icon-button mobile-menu-button" aria-label="باز کردن منو" onClick={() => setMenuOpen(true)}><MenuIcon /></button>
          <Link href="/" className="brand" aria-label="دانیا، صفحه اصلی"><span className="brand-dot">d</span><span className="brand-word">DANIA</span><small>کفش کودک</small></Link>
          <nav className="main-nav" aria-label="منوی اصلی">
            <Link href="/shop">فروشگاه</Link><Link href="/shop?category=girl">دخترانه</Link><Link href="/shop?category=boy">پسرانه</Link><Link href="/shop?category=baby">اولین قدم</Link><Link href="/about">داستان دانیا</Link>
          </nav>
          <div className="header-actions">
            <button className="icon-button" aria-label="جستجو" onClick={() => setSearchOpen(true)}><SearchIcon /></button>
            <button className="icon-button hide-mobile" aria-label="حساب کاربری"><UserIcon /></button>
            <button className="icon-button bag-button" aria-label="سبد خرید" onClick={() => setCartOpen(true)}><BagIcon />{value.cartCount > 0 && <span className="bag-count">{value.cartCount.toLocaleString("fa-IR")}</span>}</button>
          </div>
        </div>
      </header>

      {children}
      <SiteFooter />

      <div className={`drawer-overlay ${cartOpen ? "is-open" : ""}`} onClick={() => setCartOpen(false)} />
      <aside className={`cart-drawer ${cartOpen ? "is-open" : ""}`} aria-hidden={!cartOpen}>
        <div className="drawer-heading"><div><span className="eyebrow">انتخاب‌های شما</span><h2>سبد خرید</h2></div><button className="icon-button" onClick={() => setCartOpen(false)} aria-label="بستن"><CloseIcon /></button></div>
        <div className="drawer-body">
          {cart.length === 0 ? <EmptyCart close={() => setCartOpen(false)} /> : cart.map((line) => {
            const product = products.find((item) => item.id === line.productId) as Product;
            return <div className="cart-line" key={`${line.productId}-${line.size}`}>
              <div className={`mini-product product-image ${product.imagePosition}`} />
              <div className="cart-line-info"><strong>{product.name}</strong><span>سایز {line.size.toLocaleString("fa-IR")} · تعداد {line.quantity.toLocaleString("fa-IR")}</span><b>{formatPrice(product.price * line.quantity)} <small>تومان</small></b></div>
              <button className="remove-line" onClick={() => value.removeFromCart(line.productId)}>حذف</button>
            </div>;
          })}
        </div>
        {cart.length > 0 && <div className="drawer-footer"><div className="drawer-total"><span>جمع سبد</span><strong>{formatPrice(cart.reduce((sum, line) => sum + (products.find((p) => p.id === line.productId)?.price ?? 0) * line.quantity, 0))} تومان</strong></div><Link href="/checkout" className="button primary wide" onClick={() => setCartOpen(false)}>ادامه و ثبت سفارش</Link><span className="secure-note">پرداخت امن از درگاه بانکی</span></div>}
      </aside>

      <div className={`mobile-menu ${menuOpen ? "is-open" : ""}`}>
        <button className="icon-button mobile-close" onClick={() => setMenuOpen(false)} aria-label="بستن"><CloseIcon /></button>
        <Link href="/" className="brand"><span className="brand-dot">d</span><span className="brand-word">DANIA</span></Link>
        <nav><Link href="/shop">همه محصولات</Link><Link href="/shop?category=girl">دخترانه</Link><Link href="/shop?category=boy">پسرانه</Link><Link href="/shop?category=baby">اولین قدم</Link><Link href="/about">داستان دانیا</Link></nav>
      </div>

      <div className={`search-modal ${searchOpen ? "is-open" : ""}`} aria-hidden={!searchOpen}>
        <button className="icon-button search-close" onClick={() => setSearchOpen(false)} aria-label="بستن"><CloseIcon /></button>
        <div className="search-panel"><span className="eyebrow">دنبال چی می‌گردی؟</span><div className="search-input-wrap"><SearchIcon /><input value={search} onChange={(event) => setSearch(event.target.value)} autoFocus={searchOpen} placeholder="نام کفش، رنگ یا گروه سنی..." /></div><div className="search-results">{results.map((product) => <Link key={product.id} href={`/product/${product.slug}`} onClick={() => setSearchOpen(false)}><div className={`search-thumb product-image ${product.imagePosition}`} /><div><strong>{product.name}</strong><span>{product.subtitle}</span></div><b>{formatPrice(product.price)}</b></Link>)}</div></div>
      </div>
    </ShopContext.Provider>
  );
}

function EmptyCart({ close }: { close: () => void }) {
  return <div className="empty-cart"><span className="empty-cart-art"><BagIcon /></span><h3>سبدت هنوز خالیه</h3><p>یک جفت راحت برای ماجراجویی بعدی انتخاب کن.</p><Link href="/shop" className="button primary" onClick={close}>دیدن کفش‌ها</Link></div>;
}

function SiteFooter() {
  return <footer className="site-footer"><div className="container footer-grid"><div className="footer-brand"><Link href="/" className="brand light"><span className="brand-dot">d</span><span className="brand-word">DANIA</span></Link><p>برای قدم‌های کوچکی که<br/>دنیا را کشف می‌کنند.</p><a className="social-link" href="#instagram" aria-label="اینستاگرام دانیا"><InstagramIcon /> @dania.kids</a></div><div><h3>خرید</h3><Link href="/shop">همه کفش‌ها</Link><Link href="/shop?category=girl">دخترانه</Link><Link href="/shop?category=boy">پسرانه</Link><Link href="/shop?category=baby">اولین قدم</Link></div><div><h3>راهنما</h3><a href="#size-guide">انتخاب سایز</a><a href="#shipping">ارسال سفارش</a><a href="#returns">شرایط تعویض</a><a href="#contact">تماس با ما</a></div><div className="newsletter"><h3>از تازه‌ها باخبر شو</h3><p>محصول‌های جدید و قصه‌های دانیا، بدون پیام‌های اضافه.</p><form onSubmit={(event) => event.preventDefault()}><input type="email" aria-label="ایمیل" placeholder="ایمیل شما"/><button type="submit">عضویت</button></form></div></div><div className="container footer-bottom"><span>© ۱۴۰۵ دانیا — همه حقوق محفوظ است.</span><span>ساخته‌شده برای قدم‌های شاد</span></div></footer>;
}
