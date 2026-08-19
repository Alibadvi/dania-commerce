import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon, RulerIcon } from "@/components/icons";

export const metadata: Metadata = { title: "راهنمای انتخاب سایز" };
const sizes = [[14.5,24],[15.2,25],[15.8,26],[16.5,27],[17.1,28],[17.8,29],[18.5,30],[19.1,31],[19.8,32]];

export default function SizeGuidePage() {
  return <main className="page-main shell size-page"><header className="page-hero"><p className="eyebrow"><span /> کمتر از یک دقیقه</p><h1>پای کوچک، <em>سایز دقیق</em></h1><p>با سه قدم ساده، اندازه‌ی درست را پیدا کنید و با خیال راحت سفارش دهید.</p></header><section className="measure-steps"><article><span>۱</span><div className="step-art foot-art">⌇</div><h2>کاغذ را آماده کنید</h2><p>پای کودک را با جوراب روی یک کاغذ بگذارید؛ پاشنه صاف و وزن روی هر دو پا باشد.</p></article><article><span>۲</span><div className="step-art line-art"><RulerIcon /></div><h2>دور پا را بکشید</h2><p>با مداد عمود بر کاغذ، دور پا را علامت بزنید. هر دو پا را اندازه بگیرید.</p></article><article><span>۳</span><div className="step-art ruler-art"><RulerIcon /></div><h2>طول را اندازه بگیرید</h2><p>فاصله پاشنه تا بلندترین انگشت را به سانتی‌متر بخوانید و با جدول تطبیق دهید.</p></article></section><section className="size-table-wrap"><div><p className="eyebrow"><span /> جدول تبدیل</p><h2>طول پای کودک را پیدا کنید</h2><p>اگر بین دو سایز بودید، سایز بزرگ‌تر را انتخاب کنید.</p></div><table><thead><tr><th>طول پا (سانتی‌متر)</th><th>سایز دانیا</th></tr></thead><tbody>{sizes.map(([cm,size]) => <tr key={size}><td>{new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 }).format(cm)}</td><td>{new Intl.NumberFormat("fa-IR").format(size)}</td></tr>)}</tbody></table></section><div className="size-cta"><h2>هنوز مطمئن نیستید؟</h2><p>تیم دانیا با یک عکس از اندازه‌گیری شما را راهنمایی می‌کند.</p><a className="button button-secondary" href="#">گفت‌وگو با پشتیبانی <ArrowLeftIcon /></a><Link className="text-link" href="/shop">بازگشت به فروشگاه</Link></div></main>;
}
