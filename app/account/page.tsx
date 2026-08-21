import type { Metadata } from "next";
import { AccountPage } from "@/components/account-page";

export const metadata: Metadata = {
  title: "حساب کاربری من",
  description: "مدیریت مشخصات، آدرس‌های تحویل، امنیت حساب و تاریخچه سفارش‌های دانیا.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AccountPage />;
}
