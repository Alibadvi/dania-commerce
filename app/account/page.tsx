import type { Metadata } from "next";
import { AccountPage } from "@/components/account-page";

export const metadata: Metadata = {
  title: "ورود و عضویت",
  description: "ورود به حساب کاربری دانیا یا ساخت حساب جدید.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AccountPage />;
}
