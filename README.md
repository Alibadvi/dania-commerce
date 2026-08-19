# Dania Commerce

فروشگاه فارسی و راست‌به‌چپ کفش کودک دانیا با **Next.js 16، Vendure 3.7 و PostgreSQL 17**.

این مخزن یک شروع واقعی برای توسعه است، نه فقط یک صفحه‌ی نمایشی. رابط فروشگاه، کاتالوگ، صفحه محصول، سبد خرید، جستجو، فیلتر، انتخاب سایز و جریان آزمایشی تسویه‌حساب آماده است. سمت سرور شامل Vendure Shop/Admin GraphQL API، داشبورد مدیریت، worker، PostgreSQL و فضای فایل محصولات است.

## معماری

```text
Browser
  └─ Next.js storefront (:3001)
       └─ Vendure Shop API (:3000/shop-api)
            ├─ PostgreSQL (:5432)
            ├─ Admin API (:3000/admin-api)
            ├─ Dashboard (:3000/dashboard)
            └─ Assets (:3000/assets)
```

## قابلیت‌های آماده

- طراحی فارسی RTL و واکنش‌گرا برای موبایل و دسکتاپ
- صفحه اصلی، فروشگاه، فیلتر و مرتب‌سازی، جزئیات محصول و درباره ما
- سبد خرید پایدار در مرورگر و drawer تعاملی
- انتخاب سایز، علاقه‌مندی، جستجو و checkout آزمایشی
- تصویرهای اختصاصی تولیدشده برای برند دانیا
- Vendure با زبان پیش‌فرض فارسی و Dashboard دارای ترجمه فارسی
- PostgreSQL، worker، asset storage و Docker Compose
- HardenPlugin برای محدودکردن GraphQL در محیط production
- تنظیم جداگانه‌ی secrets، origin، database و asset URL با environment variables

## اجرای سریع با Docker

پیش‌نیاز: Docker Desktop یا Docker Engine به‌همراه Compose.

```bash
git clone https://github.com/Alibadvi/dania-commerce.git
cd dania-commerce
cp .env.example .env
cp backend/.env.example backend/.env
docker compose up --build
```

بعد از بالا آمدن سرویس‌ها، یک بار کانال پیش‌فرض را برای فارسی و ریال تنظیم کنید:

```bash
docker compose exec vendure node dist/seed.js
```

سپس این آدرس‌ها در دسترس‌اند:

- Storefront: `http://localhost:3001`
- Vendure Dashboard: `http://localhost:3000/dashboard`
- Shop GraphQL API: `http://localhost:3000/shop-api`
- Admin GraphQL API: `http://localhost:3000/admin-api`

قبل از اجرای عمومی، حتماً `COOKIE_SECRET` و `SUPERADMIN_PASSWORD` را عوض کنید. مقادیر پیش‌فرض فقط برای توسعه محلی هستند.

## اجرای دستی بدون Docker

Node.js 22 و یک PostgreSQL در دسترس لازم است.

```bash
# storefront
npm ci
cp .env.example .env
npm run dev

# backend (در ترمینال جدا)
cd backend
npm install
cp .env.example .env
npm run dev
# سپس در ترمینال سوم:
npm run seed
```

برای ساخت production:

```bash
npm run build
npm run build:backend
```

هر دو build در این نسخه بررسی و با موفقیت اجرا شده‌اند.

## تنظیم زبان و قیمت ایران

- سند HTML با `lang="fa"` و `dir="rtl"` رندر می‌شود.
- `defaultLanguageCode` در Vendure روی `fa` است.
- متن، اعداد و layout فروشگاه برای فارسی طراحی شده‌اند.
- قیمت رابط کاربری به **تومان** نمایش داده می‌شود. اگر کانال Vendure را با `IRR` تنظیم می‌کنید، قیمت backend را به ریال نگه دارید و هنگام نمایش بر ۱۰ تقسیم کنید. این تبدیل باید هنگام اتصال داده‌ی واقعی یک‌جا در لایه‌ی API انجام شود.
- درگاه پرداخت ایرانی داخل این starter فعال نشده؛ باید plugin درگاه انتخابی شرکت اضافه شود. checkout فعلی عمداً پرداخت واقعی انجام نمی‌دهد.

## اتصال storefront به Vendure

آدرس API از `VENDURE_SHOP_API_URL` خوانده می‌شود. query پایه در `lib/vendure.ts` آماده است. کاتالوگ نمایشی فعلی در `lib/catalog.ts` نگه داشته شده تا رابط بدون backend هم قابل مشاهده باشد.

در مرحله بعد، داده‌ی صفحات را از توابع Vendure بگیرید و mutationهای زیر را متصل کنید:

1. `addItemToOrder`
2. `adjustOrderLine`
3. `setOrderShippingAddress`
4. `setOrderShippingMethod`
5. mutation اختصاصی plugin پرداخت ایرانی

## database و production

`DB_SYNCHRONIZE=true` فقط برای اولین اجرای محلی مناسب است. برای سرور واقعی:

1. آن را `false` کنید.
2. migration تولید و بررسی کنید.
3. `npm --prefix backend run migration:run` را در فرآیند deploy اجرا کنید.
4. PostgreSQL را روی UTC نگه دارید.
5. assetها را روی volume پایدار یا S3-compatible storage منتقل کنید.
6. storefront و Vendure را پشت HTTPS و reverse proxy اجرا کنید.

## ساختار مهم

```text
app/                    Next.js routes
components/             رابط و تعاملات فروشگاه
lib/catalog.ts          کاتالوگ نمایشی
lib/vendure.ts          Shop API client پایه
public/images/          تصاویر اختصاصی محصول
backend/src/            Vendure server و worker
backend/vite.config.mts Vendure Dashboard build
docker-compose.yml      storefront + Vendure + PostgreSQL
```

## محدودیت‌های فعلی

- محصولات رابط فعلاً demo هستند؛ sync کامل با Vendure مرحله‌ی بعد است.
- حساب کاربری مشتری و OTP پیاده نشده‌اند.
- سرویس پیامک، محاسبه هزینه پست و درگاه بانکی ایران نیاز به provider واقعی دارند.
- دامنه‌های `.com` و `.ir` در کد hard-code نشده‌اند و بعداً هر دو می‌توانند به همین deployment متصل شوند.

## منابع رسمی

- [Vendure installation](https://docs.vendure.io/current/core/getting-started/installation)
- [Vendure configuration](https://docs.vendure.io/current/core/developer-guide/configuration)
- [Production security](https://docs.vendure.io/current/core/developer-guide/security)
