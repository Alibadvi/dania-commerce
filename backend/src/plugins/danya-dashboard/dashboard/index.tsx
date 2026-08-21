import "@fontsource-variable/vazirmatn";
import "./styles.css";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Page,
  PageTitle,
  defineDashboardExtension,
  useUserSettings,
  type NavMenuConfig,
  type NavMenuItem,
  type NavMenuSection,
} from "@vendure/dashboard";
import { BookOpenText, Boxes, PackagePlus, ReceiptText, Users } from "lucide-react";
import { type ReactNode, useEffect } from "react";

const dashboardBase = "/dashboard";

const labels: Record<string, string> = {
  insights: "نمای کلی",
  catalog: "کالاها",
  products: "محصولات",
  "product-variants": "تنوع‌ها (سایز و رنگ)",
  "option-groups": "ویژگی‌های انتخابی",
  facets: "دسته‌بندی و رنگ",
  collections: "ویترین‌ها",
  assets: "تصاویر",
  sales: "فروش",
  orders: "سفارش‌ها",
  customers: "مشتریان",
  "customer-groups": "گروه‌های مشتری",
  marketing: "تخفیف‌ها",
  promotions: "کدها و تخفیف‌ها",
  settings: "تنظیمات پیشرفته",
  sellers: "فروشندگان",
  channels: "کانال‌های فروش",
  "stock-locations": "محل‌های موجودی",
  administrators: "مدیران",
  roles: "نقش‌ها و دسترسی‌ها",
  "shipping-methods": "روش‌های ارسال",
  "payment-methods": "روش‌های پرداخت",
  "tax-categories": "گروه‌های مالیاتی",
  "tax-rates": "نرخ‌های مالیات",
  countries: "کشورها",
  zones: "مناطق",
  "global-settings": "تنظیمات عمومی",
  system: "فنی و پشتیبانی",
  "job-queue": "صف کارها",
  "scheduled-tasks": "کارهای زمان‌بندی‌شده",
  "settings-store": "ذخیره تنظیمات",
  "api-keys": "کلیدهای API",
};

const hiddenFromEverydayNavigation = new Set(["product-variants", "option-groups"]);

function localizeNavigation(config: NavMenuConfig): NavMenuConfig {
  return {
    sections: config.sections.map((entry) => {
      const title = labels[entry.id] ?? entry.title;
      if (!("items" in entry)) return { ...entry, title } as NavMenuItem;

      const section = entry as NavMenuSection;
      return {
        ...section,
        title,
        defaultOpen: section.id === "catalog" || section.id === "sales",
        items: section.items
          ?.filter((item) => !hiddenFromEverydayNavigation.has(item.id))
          .map((item) => ({ ...item, title: labels[item.id] ?? item.title })),
      };
    }),
  };
}

function PersianDashboard({ children }: Readonly<{ children: ReactNode }>) {
  const { settings, setDisplayLanguage, setDisplayLocale, setContentLanguage } = useUserSettings();

  useEffect(() => {
    document.documentElement.lang = "fa";
    document.documentElement.dir = "rtl";
    if (settings.displayLanguage !== "fa") setDisplayLanguage("fa");
    if (settings.displayLocale !== "fa-IR") setDisplayLocale("fa-IR");
    if (settings.contentLanguage !== "fa") setContentLanguage("fa");
  }, [settings.displayLanguage, settings.displayLocale, settings.contentLanguage]);

  return children;
}

const quickActions = [
  {
    href: `${dashboardBase}/products/new`,
    icon: PackagePlus,
    title: "افزودن محصول",
    description: "نام، توضیحات، دسته‌بندی و عکس محصول را وارد کن.",
  },
  {
    href: `${dashboardBase}/products`,
    icon: Boxes,
    title: "مدیریت محصولات",
    description: "قیمت، موجودی، سایزها و تصاویر محصولات را ویرایش کن.",
  },
  {
    href: `${dashboardBase}/orders`,
    icon: ReceiptText,
    title: "بررسی سفارش‌ها",
    description: "سفارش‌های جدید، پرداخت و وضعیت ارسال را ببین.",
  },
  {
    href: `${dashboardBase}/customers`,
    icon: Users,
    title: "مشتریان",
    description: "اطلاعات و سابقه خرید مشتری‌ها را مدیریت کن.",
  },
] as const;

function OperatorGuide() {
  return (
    <Page pageId="danya-operator-guide" className="danya-guide" dir="rtl">
      <PageTitle>راهنمای ساده مدیریت دانیا</PageTitle>

      <section className="danya-guide-hero">
        <div>
          <span>راهنمای مدیر فروشگاه</span>
          <h2>کارهای روزانه، بدون اصطلاحات فنی</h2>
          <p>از این صفحه برای افزودن کالا، کنترل موجودی و رسیدگی به سفارش‌ها شروع کن.</p>
        </div>
        <BookOpenText aria-hidden="true" />
      </section>

      <div className="danya-action-grid">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <a key={action.href} href={action.href} className="danya-action-card">
              <Icon aria-hidden="true" />
              <strong>{action.title}</strong>
              <span>{action.description}</span>
            </a>
          );
        })}
      </div>

      <div className="danya-guide-grid">
        <Card>
          <CardHeader>
            <CardTitle>برای کفش کدام نوع محصول را انتخاب کنم؟</CardTitle>
            <CardDescription>در بیشتر موارد «محصول دارای انتخاب» درست است.</CardDescription>
          </CardHeader>
          <CardContent className="danya-steps">
            <p><b>۱</b><span><strong>محصول ساده</strong> فقط وقتی استفاده می‌شود که کالا هیچ سایز یا رنگ انتخابی ندارد.</span></p>
            <p><b>۲</b><span><strong>محصول دارای انتخاب</strong> برای کفش است؛ مشتری باید سایز را انتخاب کند.</span></p>
            <p><b>۳</b><span>نام ویژگی را واضح بنویس: <strong>«سایز — نام محصول»</strong> و مقدارها را مثل ۲۶، ۲۷ و ۲۸ وارد کن.</span></p>
            <p><b>۴</b><span>برای هر سایز، فقط <strong>کد کالا، قیمت و موجودی</strong> را کامل کن و تنوع‌ها را بساز.</span></p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>معنی بخش‌ها به زبان ساده</CardTitle>
            <CardDescription>همه قابلیت‌ها حفظ شده‌اند؛ فقط منوی روزانه خلوت‌تر است.</CardDescription>
          </CardHeader>
          <CardContent className="danya-terms">
            <p><strong>محصول</strong><span>مدل اصلی کفش، توضیحات و عکس‌ها</span></p>
            <p><strong>ویژگی انتخابی</strong><span>نوع انتخاب مشتری؛ مثل سایز یا رنگ</span></p>
            <p><strong>تنوع</strong><span>نسخه قابل فروش محصول؛ مثلاً همان کفش در سایز ۲۸</span></p>
            <p><strong>کد کالا (SKU)</strong><span>کد یکتای انبار برای هر تنوع</span></p>
          </CardContent>
        </Card>
      </div>

      <details className="danya-advanced">
        <summary>ابزارهای پیشرفته</summary>
        <p>این صفحه‌ها حذف نشده‌اند و فقط از منوی روزانه کنار رفته‌اند.</p>
        <div>
          <a href={`${dashboardBase}/product-variants`}>همه تنوع‌ها</a>
          <a href={`${dashboardBase}/option-groups`}>همه ویژگی‌های انتخابی</a>
        </div>
      </details>
    </Page>
  );
}

defineDashboardExtension({
  customProviders: [
    {
      id: "danya-persian-dashboard",
      component: PersianDashboard,
      location: "app",
      order: 100,
    },
  ],
  routes: [
    {
      path: "/danya-guide",
      component: () => <OperatorGuide />,
      navMenuItem: {
        sectionId: "catalog",
        id: "danya-guide",
        title: "راهنمای ساده مدیریت",
        icon: BookOpenText,
        order: 10,
        requiresPermission: ["ReadProduct", "ReadCatalog"],
      },
    },
  ],
  navSections: localizeNavigation,
});
