"use client";

import Link from "next/link";
import { useState } from "react";
import { BagIcon, CloseIcon, MenuIcon, SearchIcon, UserIcon } from "./icons";
import { useCart } from "./cart-provider";

export function Header() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  return (
    <>
      <div className="announcement">ارسال رایگان برای خریدهای بالای ۳ میلیون تومان <span>♡</span></div>
      <header className="site-header">
        <div className="shell header-inner">
          <button className="header-icon mobile-only" onClick={() => setOpen(true)} aria-label="باز کردن منو"><MenuIcon /></button>
          <nav className="desktop-nav" aria-label="منوی اصلی">
            <Link href="/shop">فروشگاه</Link><Link href="/shop?category=everyday">دخترانه</Link><Link href="/shop?category=play">پسرانه</Link><Link href="/size-guide">راهنمای سایز</Link><Link href="/about">قصه‌ی ما</Link>
          </nav>
          <Link href="/" className="brand" aria-label="دانیا، صفحه اصلی"><b>DANIA</b><span>دانیا</span><i /></Link>
          <div className="header-tools">
            <button className="header-icon desktop-tool" aria-label="جستجو"><SearchIcon /></button>
            <Link className="header-icon desktop-tool" href="/account" aria-label="حساب کاربری"><UserIcon /></Link>
            <Link className="header-icon cart-tool" href="/cart" aria-label={`سبد خرید، ${count} کالا`}><BagIcon />{count > 0 && <span>{new Intl.NumberFormat("fa-IR").format(count)}</span>}</Link>
          </div>
        </div>
      </header>
      {open && <div className="mobile-menu" role="dialog" aria-modal="true">
        <button className="header-icon" onClick={() => setOpen(false)} aria-label="بستن منو"><CloseIcon /></button>
        <Link href="/" className="brand"><b>DANIA</b><span>دانیا</span><i /></Link>
        <nav onClick={() => setOpen(false)}><Link href="/shop">همه محصولات</Link><Link href="/shop?category=everyday">کفش روزمره</Link><Link href="/shop?category=play">بازی و حرکت</Link><Link href="/size-guide">راهنمای سایز</Link><Link href="/about">خانواده‌ی دانیا</Link><Link href="/account">ورود / عضویت</Link></nav>
      </div>}
    </>
  );
}
