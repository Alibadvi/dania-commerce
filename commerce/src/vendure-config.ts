import "dotenv/config";
import path from "node:path";
import {
  DefaultJobQueuePlugin,
  DefaultSearchPlugin,
  LanguageCode,
  NativeAuthenticationStrategy,
  VendureConfig,
} from "@vendure/core";
import { AssetServerPlugin, PresetOnlyStrategy } from "@vendure/asset-server-plugin";
import { DashboardPlugin } from "@vendure/dashboard/plugin";
import { EmailPlugin, defaultEmailHandlers } from "@vendure/email-plugin";
import { HardenPlugin } from "@vendure/harden-plugin";
import { ZarinpalPlugin, zarinpalPaymentHandler } from "./plugins/zarinpal/zarinpal.plugin";

const IS_DEV = process.env.APP_ENV !== "production";
const rootDir = path.resolve(__dirname, "..");
const emailPlugin = IS_DEV
  ? EmailPlugin.init({
      handlers: defaultEmailHandlers,
      templatePath: path.join(rootDir, "static/email/templates"),
      devMode: true,
      outputPath: path.join(rootDir, "static/email/test-emails"),
      route: "mailbox",
    })
  : EmailPlugin.init({
      handlers: defaultEmailHandlers,
      templatePath: path.join(rootDir, "static/email/templates"),
      transport: {
        type: "smtp",
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: { user: process.env.SMTP_USER ?? "", pass: process.env.SMTP_PASSWORD ?? "" },
      },
    });

export const config: VendureConfig = {
  apiOptions: {
    port: Number(process.env.PORT ?? 3000),
    adminApiPath: "admin-api",
    shopApiPath: "shop-api",
    ...(IS_DEV ? { adminApiPlayground: {}, shopApiPlayground: {} } : {}),
    cors: {
      origin: (process.env.STOREFRONT_URL ?? "http://localhost:4173").split(","),
      credentials: true,
    },
  },
  authOptions: {
    tokenMethod: ["cookie", "bearer"],
    cookieOptions: {
      secret: process.env.COOKIE_SECRET ?? "development-only-cookie-secret-change-me",
      secure: !IS_DEV,
      sameSite: IS_DEV ? "lax" : "none",
    },
    superadminCredentials: {
      identifier: process.env.SUPERADMIN_USERNAME ?? "owner",
      password: process.env.SUPERADMIN_PASSWORD ?? "development-only-change-me",
    },
    shopAuthenticationStrategy: [new NativeAuthenticationStrategy()],
  },
  dbConnectionOptions: {
    type: "postgres",
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 5432),
    database: process.env.DB_NAME ?? "dania",
    username: process.env.DB_USERNAME ?? "dania",
    password: process.env.DB_PASSWORD ?? "dania",
    synchronize: IS_DEV,
    logging: false,
    migrations: [path.join(__dirname, "migrations/*.+(js|ts)")],
  },
  defaultLanguageCode: LanguageCode.fa,
  paymentOptions: { paymentMethodHandlers: [zarinpalPaymentHandler] },
  customFields: {
    Product: [
      { name: "careInstructions", type: "localeText", label: [{ languageCode: LanguageCode.fa, value: "راهنمای نگهداری" }] },
    ],
    ProductVariant: [
      { name: "colorHex", type: "string", length: 7, label: [{ languageCode: LanguageCode.fa, value: "کد رنگ" }] },
      { name: "ageGroup", type: "string", label: [{ languageCode: LanguageCode.fa, value: "گروه سنی" }] },
    ],
  },
  plugins: [
    AssetServerPlugin.init({
      route: "assets",
      assetUploadDir: path.join(rootDir, "static/assets"),
      assetUrlPrefix: process.env.ASSET_URL_PREFIX,
      imageTransformStrategy: new PresetOnlyStrategy({ defaultPreset: "medium" }),
    }),
    DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }),
    DefaultSearchPlugin.init({ bufferUpdates: false, indexStockStatus: true }),
    emailPlugin,
    ZarinpalPlugin,
    HardenPlugin.init({ maxQueryComplexity: 500, apiMode: IS_DEV ? "dev" : "prod" }),
    DashboardPlugin.init({ route: "dashboard", appDir: path.join(rootDir, "dist/dashboard") }),
  ],
};
