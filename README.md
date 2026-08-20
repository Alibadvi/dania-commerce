# Dania Commerce

فروشگاه فارسی و راست‌به‌چپ کفش کودک دانیا با **Next.js 16 / Vinext، Vendure 3.7 و PostgreSQL 17**.

این نسخه یکپارچه است: کاتالوگ از Vendure خوانده می‌شود، هر سایز یک Product Variant واقعی است، سبد خرید همان Active Order در Vendure است و تسویه مهمان اطلاعات مشتری، نشانی، روش ارسال، وضعیت سفارش و پرداخت آزمایشی محلی را در backend ثبت می‌کند. Dashboard نیز همان داده‌ها و سفارش‌ها را مدیریت می‌کند.

## اجرای همه سرویس‌ها با یک فرمان

پیش‌نیاز: Docker Desktop یا Docker Engine به‌همراه Docker Compose. در Windows، خود برنامه Docker Desktop باید باز باشد و پایین پنجره وضعیت **Engine running** را نشان دهد.

```bash
git clone https://github.com/Alibadvi/dania-commerce.git
cd dania-commerce
cp .env.example .env
docker compose up --build
```

در PowerShell، اگر فایل `.env` را قبلاً نساخته‌اید، به‌جای `cp` می‌توانید این فرمان را اجرا کنید:

```powershell
Copy-Item .env.example .env
docker compose up --build
```

Compose سرویس‌ها را به ترتیب درست اجرا می‌کند:

1. PostgreSQL آماده می‌شود.
2. `vendure-init` کانال فارسی/ریال، ایران، روش‌های ارسال، پرداخت محلی و ۸ محصول با تمام سایزها را به‌شکل idempotent ایجاد می‌کند.
3. Vendure API و worker بالا می‌آیند.
4. storefront پس از سالم‌شدن Shop API شروع می‌شود.

هیچ seed دستی لازم نیست. در اولین اجرا، build و import تصاویر ممکن است چند دقیقه طول بکشد.

| بخش | آدرس محلی | توضیح |
|---|---|---|
| Storefront | `http://localhost:3001` | فروشگاه و checkout |
| Vendure Dashboard | `http://localhost:3000/dashboard` | CMS مدیریت محصول، موجودی، مشتری و سفارش |
| Dev mailbox | `http://localhost:3000/mailbox` | ایمیل‌های تراکنشی محلی |
| Shop GraphQL | `http://localhost:3000/shop-api` | API عمومی فروشگاه |
| Admin GraphQL | `http://localhost:3000/admin-api` | فقط مدیریت؛ در production نباید عمومی شود |
| PostgreSQL | `127.0.0.1:5432` | فقط روی loopback میزبان منتشر می‌شود |

ورود محلی Dashboard:

```text
username: superadmin
password: danya-local-admin-password
```

این مشخصات فقط برای دستگاه توسعه هستند. در یک سیستم اشتراکی، آن‌ها را در `.env` تغییر دهید.

## سناریوی تست کامل

1. `http://localhost:3001/shop` را باز کنید.
2. یک محصول و سایز را انتخاب و به سبد اضافه کنید.
3. تعداد را در drawer تغییر دهید؛ صفحه را refresh کنید و پایداری نشست را ببینید.
4. وارد checkout شوید، اطلاعات معتبر وارد کنید و یکی از روش‌های ارسال backend را انتخاب کنید.
5. سفارش را ثبت کنید. `ALLOW_DUMMY_PAYMENTS=true` فقط در محیط محلی پرداخت آزمایشی را settle می‌کند و هیچ مبلغ واقعی دریافت نمی‌شود.
6. در Dashboard بخش Orders، همان سفارش، مشتری، نشانی، خطوط و پرداخت را بررسی کنید.
7. ایمیل سفارش محلی را در mailbox ببینید.

کد تخفیف در صورت ساخت Promotion در Dashboard مستقیماً با mutation واقعی Vendure اعمال می‌شود؛ هیچ تخفیف نمایشی در frontend محاسبه نمی‌شود.

## فرمان‌های روزمره Docker

```bash
# وضعیت هر پنج سرویس
docker compose ps

# دنبال‌کردن لاگ‌های برنامه
docker compose logs -f vendure worker storefront

# توقف و نگه‌داشتن database و assetها
docker compose down

# build مجدد بعد از تغییر dependency یا Dockerfile
docker compose up --build
```

برای پاک‌کردن کامل داده‌های محلی می‌توانید `docker compose down -v` بزنید. این فرمان تمام سفارش‌ها، محصولات importشده و assetهای volume را حذف می‌کند.

## معماری اتصال

```text
Browser
  └─ Next.js storefront (:3001)
       └─ /api/commerce (same-origin allowlisted gateway)
            └─ Vendure Shop API (:3000/shop-api)
                 ├─ PostgreSQL 17
                 ├─ Vendure worker
                 ├─ Asset storage
                 └─ Dashboard / Admin API
```

Browser هیچ GraphQL دلخواه یا Admin API را proxy نمی‌کند. gateway فقط عملیات مشخص کاتالوگ/سبد/کوپن/checkout را می‌پذیرد، ورودی‌ها را validate می‌کند، درخواست cross-site و payload بزرگ را رد می‌کند و session token Vendure را در cookie `HttpOnly` و `SameSite=Lax` نگه می‌دارد.

## اجرای دستی برای توسعه

Node.js **22.13 یا جدیدتر** و PostgreSQL لازم است. Node 20 پشتیبانی نمی‌شود. در Windows نسخه را با `node --version` بررسی کنید؛ سپس ساده‌ترین راه این است که فقط database را با Docker اجرا کنید:

```bash
docker compose up postgres
```

سپس در ترمینال‌های جدا:

```bash
# ترمینال ۱: backend + Dashboard
cd backend
npm ci
cp .env.example .env
npm run seed
npm run dev
```

```bash
# ترمینال ۲: worker
cd backend
npm run dev:worker
```

```bash
# ترمینال ۳: storefront
npm ci
cp .env.example .env
npm run dev
```

## کیفیت، تست و CI

```bash
npm run lint
npm run typecheck
npm test
npm run build:backend

# همه بررسی‌ها پشت سر هم
npm run check
```

تست‌ها شامل اعتبارسنجی checkout و یک contract test کامل هستند که Shop API را شبیه‌سازی می‌کند و مسیر `add item → session cookie → adjust → shipping quote → customer/address → payment` را از Worker واقعی اجرا می‌کند. GitHub Actions همین buildها و تست‌ها را روی push و pull request اجرا می‌کند و Dependabot dependencyهای frontend، backend و Actions را دنبال می‌کند.

## امنیت production

فایل `docker-compose.production.yml` guardrailهای production را اضافه می‌کند. اجرای production باید هر دو فایل را استفاده کند:

```bash
docker compose -f docker-compose.yml -f docker-compose.production.yml up --build
```

قبل از آن باید این موارد انجام شده باشند:

- `COOKIE_SECRET` تصادفی با حداقل ۳۲ کاراکتر و passwordهای قوی تنظیم شوند.
- `APP_ORIGINS` و URLهای storefront/asset فقط HTTPS باشند.
- `DB_SYNCHRONIZE=false` بماند و migration بررسی‌شده اجرا شود.
- Admin API و Dashboard پشت VPN، allowlist یا احراز هویت reverse proxy قرار گیرند؛ فقط Shop API عمومی باشد.
- rate limiting لبه شبکه (برای نمونه Cloudflare) علاوه بر محدودیت داخل gateway فعال شود.
- SMTP و From address تأییدشده برای ایمیل تراکنشی تنظیم شوند.
- assetها از volume محلی به object storage پایدار/S3-compatible منتقل شوند.
- backup، مانیتورینگ خطا، log retention و restore drill تعریف شوند.

Vendure در production بدون secretهای امن، SMTP، HTTPS origin یا با `DB_SYNCHRONIZE=true`/dummy payment عمداً start نمی‌شود. `HardenPlugin` نیز introspection/playground را می‌بندد و پیچیدگی query را محدود می‌کند.

برای database production تازه، ابتدا migration را علیه PostgreSQL خالی با همان config تولید و review کنید:

```bash
cd backend
npx vendure migrate -g initial-schema
npx vendure migrate -r
```

## پرداخت واقعی

پرداخت محلی کاملاً به order state machine متصل است، اما درگاه بانکی واقعی عمداً بدون provider و credential فعال نشده است. در production، dummy payment هم در seed و هم در storefront غیرفعال است؛ بنابراین برای دریافت وجه باید plugin درگاه انتخابی (مثلاً زرین‌پال/IDPay/درگاه مستقیم بانک)، callback امضاشده، idempotency و reconciliation همان provider اضافه شود. این مرز امنیتی جلوی ثبت پرداخت جعلی در production را می‌گیرد.

## SEO فنی

- metadata و canonical برای صفحات اصلی، فروشگاه، درباره و محصول
- Open Graph و Twitter cards
- `sitemap.xml` پویا از کاتالوگ Vendure
- `robots.txt` با عدم index برای checkout و API
- JSON-LD برای Organization، WebSite، Product/Offer و BreadcrumbList
- HTML فارسی با `lang="fa"` و `dir="rtl"`
- headerهای CSP، frame denial، nosniff، referrer و permissions policy
- checkout با `noindex` و قیمت schema.org به IRR، در حالی که رابط کاربری تومان نمایش می‌دهد

## واحد پول

Vendure مقدارها را با `IRR` و به ریال نگه می‌دارد. تبدیل ریال به تومان فقط یک بار در لایه storefront انجام می‌شود. seed نیز قیمت محصول و ارسال را به ریال وارد می‌کند؛ بنابراین Dashboard، order totals و محاسبات backend منبع حقیقت هستند.

## منابع رسمی

- [Vendure Storefront API](https://docs.vendure.io/current/core/storefront/connect-api)
- [Vendure checkout flow](https://docs.vendure.io/current/core/storefront/checkout-flow)
- [Vendure production security](https://docs.vendure.io/current/core/developer-guide/security)
- [Next.js Metadata](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)
