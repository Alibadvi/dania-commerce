import type { Metadata } from "next";
import { AboutStory } from "@/components/about-story";

export const metadata: Metadata = {
  title: "درباره دانیا | کفش کودک برای حرکت آزاد",
  description:
    "با فلسفه طراحی دانیا آشنا شوید؛ کفش کودک با پنجه جادار، زیره منعطف و وزن کم برای پاهای درحال رشد.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "درباره دانیا | کفش کودک برای حرکت آزاد",
    description:
      "طراحی کودک‌محور با فرم طبیعی، انعطاف مناسب و وزن کم؛ برای قدم‌هایی که هر روز دنیای تازه‌ای کشف می‌کنند.",
    url: "/about",
    type: "website",
  },
};

export default function AboutPage() {
  return <AboutStory />;
}