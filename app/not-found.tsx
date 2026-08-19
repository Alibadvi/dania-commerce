import Link from "next/link";

export default function NotFound() {
  return <main className="not-found"><span>۴۰۴</span><h1>این کفش از قفسه رفته!</h1><p>صفحه‌ای که دنبالش بودی پیدا نشد.</p><Link href="/shop" className="button primary">برگشت به فروشگاه</Link></main>;
}
