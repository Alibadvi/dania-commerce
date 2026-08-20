import "dotenv/config";
import path from "node:path";
import {
  bootstrapWorker,
  ChannelService,
  ConfigService,
  CurrencyCode,
  LanguageCode,
  PaymentMethodService,
  ProductService,
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
    const firstProduct = await productService.findOneBySlug(ctx, "roshan-blue");
    if (!firstProduct) {
      const csvPath = path.resolve(process.env.SEED_PRODUCTS_CSV ?? path.join(process.cwd(), "seed-data/products.csv"));
      const progress = await importProductsFromCsv(app, csvPath, LanguageCode.fa, channel);
      if (progress.errors?.length) throw new Error(`Catalog import failed: ${progress.errors.join("; ")}`);
      await app.get(SearchService).reindex(ctx);
    }
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
