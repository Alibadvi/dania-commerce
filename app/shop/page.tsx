import type { Metadata } from "next";
import { ShopClient } from "@/components/shop-client";

export const metadata: Metadata = { title: "فروشگاه کفش کودک" };

export default function ShopPage() {
  return <main className="page-main shell">
    <header className="page-hero shop-hero">
      <p className="eyebrow"><span /> کالکشن دانیا</p>
      <h1>کفش برای <em>کشف کردن</em></h1>
      <p>سبک، نرم و همراهِ مطمئن پاهای کوچک؛ برای هر روز و هر ماجراجویی.</p>
    </header>
    <ShopClient />
  </main>;
}
