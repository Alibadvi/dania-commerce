import type { Metadata } from "next";
import { ShopShell } from "@/components/shop-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "دانیا | کفش برای قدم‌های کوچک",
    template: "%s | دانیا",
  },
  description:
    "فروشگاه تخصصی کفش کودک دانیا؛ انتخاب‌های راحت، بادوام و رنگی برای قدم‌های کوچک.",
  keywords: ["کفش کودک", "کفش بچگانه", "کفش دخترانه", "کفش پسرانه", "دانیا"],
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body><ShopShell>{children}</ShopShell></body>
    </html>
  );
}
