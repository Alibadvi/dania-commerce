import type { Metadata } from "next";
import { ShopShell } from "@/components/shop-shell";
import { JsonLd } from "@/components/json-ld";
import { fetchVendureProducts } from "@/lib/vendure";
import { absoluteUrl, siteOrigin } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  title: {
    default: "دانیا | کفش برای قدم‌های کوچک",
    template: "%s | دانیا",
  },
  description:
    "فروشگاه تخصصی کفش کودک دانیا؛ انتخاب‌های راحت، بادوام و رنگی برای قدم‌های کوچک.",
  keywords: ["کفش کودک", "کفش بچگانه", "کفش دخترانه", "کفش پسرانه", "دانیا"],
  other: { "codex-preview": "development" },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: "دانیا",
    title: "دانیا | کفش برای قدم‌های کوچک",
    description: "کفش کودک سبک، بادوام و راحت برای بازی و رشد آزاد.",
    images: [{ url: "/images/danya-hero-dark.webp", width: 1200, height: 658, alt: "کتانی کودک دانیا روی صحنه طراحی" }],
  },
  twitter: { card: "summary_large_image", title: "دانیا | کفش برای قدم‌های کوچک", description: "کفش کودک سبک، بادوام و راحت.", images: ["/images/danya-hero-dark.webp"] },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export const viewport = {
  themeColor: "#fffaf0",
  colorScheme: "light",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const catalog = await fetchVendureProducts();
  const organization = {
    "@context": "https://schema.org", "@type": "Organization", name: "دانیا", url: siteOrigin(),
    logo: absoluteUrl("/favicon.svg"), sameAs: ["https://instagram.com/dania.kids"],
  };
  const website = {
    "@context": "https://schema.org", "@type": "WebSite", name: "دانیا", url: siteOrigin(), inLanguage: "fa-IR",
    potentialAction: { "@type": "SearchAction", target: `${absoluteUrl("/shop")}?q={search_term_string}`, "query-input": "required name=search_term_string" },
  };
  return (
    <html lang="fa" dir="rtl">
      <body><JsonLd data={[organization, website]} /><ShopShell catalog={catalog}>{children}</ShopShell></body>
    </html>
  );
}
