import Link from "next/link";

export function Footer() {
  return <footer className="footer">
    <div className="shell footer-grid">
      <div className="footer-brand"><Link href="/" className="brand brand-light"><b>DANIA</b><span>دانیا</span><i /></Link><p>برای قدم‌های کوچک،<br />برای رویاهای بزرگ.</p><div className="socials"><a href="#">اینستاگرام</a><a href="#">واتساپ</a></div></div>
      <div><h3>خرید از دانیا</h3><Link href="/shop">محصولات</Link><Link href="/size-guide">راهنمای سایز</Link><Link href="/cart">سبد خرید</Link><Link href="/account">پیگیری سفارش</Link></div>
      <div><h3>خانواده دانیا</h3><Link href="/about">درباره ما</Link><a href="#">قانون ۷۰</a><a href="#">مجله دانیا</a><a href="#">فرصت همکاری</a></div>
      <div><h3>کنار شما هستیم</h3><p>شنبه تا پنجشنبه، ۹ تا ۱۸</p><a dir="ltr" href="tel:+982100000000">۰۲۱ ۰۰۰۰ ۰۰۰۰</a><a href="mailto:hello@dania.ir">hello@dania.ir</a></div>
    </div>
    <div className="shell footer-bottom"><span>© ۱۴۰۵ دانیا؛ تمام حقوق محفوظ است.</span><span>حریم خصوصی · قوانین و مقررات</span><span>طراحی‌شده با عشق برای کودکان ایران</span></div>
  </footer>;
}
