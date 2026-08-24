import "dotenv/config";
import { promises as fs } from "node:fs";
import path from "node:path";
import {
  Asset,
  bootstrapWorker,
  ChannelService,
  ConfigService,
  CurrencyCode,
  LanguageCode,
  PaymentMethodService,
  ProductOptionGroupService,
  ProductService,
  ProductVariantService,
  RequestContextService,
  SearchService,
  ShippingMethodService,
  TransactionalConnection,
  User,
  type InitialData,
  type RequestContext,
} from "@vendure/core";
import { importProductsFromCsv, populateCollections, populateInitialData } from "@vendure/core/cli/index.js";
import { config } from "./vendure-config.js";

const seedProductSlugs = [
  "roshan-blue",
  "naranj-sunset",
  "sabz-park",
  "yas-pink",
  "abr-cream",
  "darya-navy",
  "shafagh-lilac",
  "aftab-yellow",
] as const;
const seedVariantCount = 44;

async function restoreDemoAssets(app: Awaited<ReturnType<typeof bootstrapWorker>>["app"]) {
  if (process.env.RESTORE_DEMO_ASSETS !== "true") return;

  const uploadDir = path.resolve(process.env.ASSET_UPLOAD_DIR ?? path.join(process.cwd(), "static/assets"));
  const importDir = path.resolve(process.env.IMPORT_ASSETS_DIR ?? path.join(process.cwd(), "import-assets"));
  const seedImage = path.join(importDir, "danya-catalog-grid.png");
  await fs.access(seedImage);

  const assets = await app.get(TransactionalConnection).getRepository(Asset).find();
  const relativePaths = new Set(
      assets
        .flatMap((asset) => [asset.source, asset.preview])
        .filter(
          (value): value is string =>
            typeof value === "string" && value.includes("danya-catalog-grid"),
        ),
  );

  for (const relativePath of relativePaths) {
    const target = path.resolve(uploadDir, relativePath);
    if (!target.startsWith(`${uploadDir}${path.sep}`)) continue;
    try {
      await fs.access(target);
    } catch {
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.copyFile(seedImage, target);
    }
  }
}

const initialData: InitialData = {
  defaultLanguage: LanguageCode.fa,
  defaultZone: "ایران",
  countries: [{ code: "IR", name: "ایران", zone: "ایران" }],
  taxRates: [{ name: "standard", percentage: 0 }],
  shippingMethods: [],
  paymentMethods: [],
  collections: [
    { name: "دخترانه", slug: "girl", filters: [{ code: "facet-value-filter", args: { facetValueNames: ["دخترانه"], containsAny: false } }] },
    { name: "پسرانه", slug: "boy", filters: [{ code: "facet-value-filter", args: { facetValueNames: ["پسرانه"], containsAny: false } }] },
    { name: "اولین قدم", slug: "baby", filters: [{ code: "facet-value-filter", args: { facetValueNames: ["نوزادی"], containsAny: false } }] },
  ],
};

async function superadminContext(app: Awaited<ReturnType<typeof bootstrapWorker>>["app"]): Promise<RequestContext> {
  const { superadminCredentials } = app.get(ConfigService).authOptions;
  const superadmin = await app.get(TransactionalConnection)
    .getRepository(User)
    .findOneOrFail({ where: { identifier: superadminCredentials.identifier } });
  return app.get(RequestContextService).create({ apiType: "admin", user: superadmin, languageCode: LanguageCode.fa });
}

async function ensureShippingMethods(app: Awaited<ReturnType<typeof bootstrapWorker>>["app"], ctx: RequestContext) {
  const service = app.get(ShippingMethodService);
  const existing = await service.findAll(ctx, { take: 100 });
  const definitions = [
    {
      code: "danya-standard",
      name: "ارسال استاندارد",
      description: "۲ تا ۴ روز کاری؛ برای خرید بالای ۲ میلیون تومان رایگان",
      calculator: {
        code: "danya-standard-shipping-calculator",
        arguments: [
          { name: "rate", value: "690000" },
          { name: "freeAbove", value: "20000000" },
          { name: "taxRate", value: "0" },
        ],
      },
    },
    {
      code: "danya-express-tehran",
      name: "ارسال سریع تهران",
      description: "همان روز یا روز کاری بعد",
      calculator: {
        code: "default-shipping-calculator",
        arguments: [{ name: "rate", value: "1200000" }, { name: "taxRate", value: "0" }],
      },
    },
  ];

  for (const definition of definitions) {
    const current = existing.items.find((item) => item.code === definition.code);
    const input = {
      code: definition.code,
      fulfillmentHandler: "manual-fulfillment",
      checker: { code: "default-shipping-eligibility-checker", arguments: [{ name: "orderMinimum", value: "0" }] },
      calculator: definition.calculator,
      translations: [{ languageCode: LanguageCode.fa, name: definition.name, description: definition.description }],
    };
    if (current) await service.update(ctx, { id: current.id, ...input });
    else await service.create(ctx, input);
  }
}

async function ensureDevelopmentPayment(app: Awaited<ReturnType<typeof bootstrapWorker>>["app"], ctx: RequestContext) {
  const service = app.get(PaymentMethodService);
  const existing = await service.findAll(ctx, { take: 100 });
  const current = existing.items.find((item) => item.code === "danya-development-payment");
  const enabled = process.env.ALLOW_DUMMY_PAYMENTS === "true" && process.env.APP_ENV !== "production";
  const input = {
    code: "danya-development-payment",
    enabled,
    handler: { code: "dummy-payment-handler", arguments: [{ name: "automaticSettle", value: "true" }] },
    translations: [{ languageCode: LanguageCode.fa, name: "پرداخت آزمایشی محلی", description: "فقط برای تست محلی؛ در production غیرفعال است" }],
  };
  if (current) await service.update(ctx, { id: current.id, ...input });
  else if (enabled) await service.create(ctx, input);
}

/**
 * Vendure option groups are product-scoped in this catalog. Giving every group
 * the bare display name "سایز" makes the global selector look like a list of
 * duplicates. Keep the stable technical codes, but make the operator-facing
 * names identify their product. This is idempotent and also upgrades existing
 * local databases when vendure-init runs again.
 */
async function makeSizeGroupNamesClear(
  app: Awaited<ReturnType<typeof bootstrapWorker>>["app"],
  ctx: RequestContext,
) {
  const productService = app.get(ProductService);
  const optionGroupService = app.get(ProductOptionGroupService);

  for (const slug of seedProductSlugs) {
    const product = await productService.findOneBySlug(ctx, slug);
    if (!product) continue;

    const groups = await optionGroupService.getOptionGroupsByProductId(ctx, product.id);
    for (const group of groups) {
      const values = group.options?.map((option) => option.name.trim()) ?? [];
      const isSizeGroup =
        group.name.trim() === "سایز" ||
        (values.length > 0 && values.every((value) => /^\d+$/.test(value)));
      const clearName = `سایز — ${product.name}`;
      if (!isSizeGroup || group.name === clearName) continue;

      await optionGroupService.update(ctx, {
        id: group.id,
        translations: [{ languageCode: LanguageCode.fa, name: clearName }],
      });
    }
  }
}

async function seed() {
  const worker = await bootstrapWorker(config);
  const { app } = worker;
  try {
    await populateInitialData(app, initialData);
    const ctx = await superadminContext(app);
    const channelService = app.get(ChannelService);
    const channel = await channelService.getDefaultChannel(ctx);
    await channelService.update(ctx, {
      id: channel.id,
      defaultLanguageCode: LanguageCode.fa,
      availableLanguageCodes: [LanguageCode.fa],
      defaultCurrencyCode: CurrencyCode.IRR,
      availableCurrencyCodes: [CurrencyCode.IRR],
      pricesIncludeTax: true,
    });

    await ensureShippingMethods(app, ctx);
    await ensureDevelopmentPayment(app, ctx);

    const productService = app.get(ProductService);
    const seedProducts = await Promise.all(seedProductSlugs.map((slug) => productService.findOneBySlug(ctx, slug)));
    const seedVariants = (await app.get(ProductVariantService).findAll(ctx, { take: 1000 })).items.filter((variant) =>
      variant.sku.startsWith("DAN-"),
    );
    const existingProductCount = seedProducts.filter(Boolean).length;
    const catalogIsEmpty = existingProductCount === 0 && seedVariants.length === 0;
    const catalogIsComplete = existingProductCount === seedProductSlugs.length && seedVariants.length === seedVariantCount;

    if (!catalogIsEmpty && !catalogIsComplete) {
      throw new Error(
        `Catalog seed is incomplete (${existingProductCount}/${seedProductSlugs.length} products, ${seedVariants.length}/${seedVariantCount} variants). Reset the local Docker volumes before retrying; never delete production data this way.`,
      );
    }

    if (catalogIsEmpty) {
      const csvPath = path.resolve(process.env.SEED_PRODUCTS_CSV ?? path.join(process.cwd(), "seed-data/products.csv"));
      const progress = await importProductsFromCsv(app, csvPath, LanguageCode.fa, channel);
      if (progress.errors?.length) throw new Error(`Catalog import failed: ${progress.errors.join("; ")}`);
      if (progress.imported !== seedProductSlugs.length) {
        throw new Error(`Catalog import created ${progress.imported}/${seedProductSlugs.length} expected products.`);
      }
      await app.get(SearchService).reindex(ctx);
    }
    await restoreDemoAssets(app);
    await makeSizeGroupNamesClear(app, ctx);
    await populateCollections(app, initialData, channel);
    console.log("Danya seed complete: Persian/IRR channel, Iran zone, shipping, local payment and catalog are ready.");
  } finally {
    await app.close();
  }
}

seed().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
