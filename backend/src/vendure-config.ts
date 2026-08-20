import "dotenv/config";
import path from "node:path";
import { AssetServerPlugin } from "@vendure/asset-server-plugin";
import {
  DefaultJobQueuePlugin,
  DefaultSearchPlugin,
  defaultShippingCalculator,
  defaultShippingEligibilityChecker,
  LanguageCode,
  LogLevel,
  dummyPaymentHandler,
  type VendureConfig,
} from "@vendure/core";
import { DashboardPlugin } from "@vendure/dashboard/plugin";
import { defaultEmailHandlers, EmailPlugin, FileBasedTemplateLoader } from "@vendure/email-plugin";
import { HardenPlugin } from "@vendure/harden-plugin";
import { danyaStandardShippingCalculator } from "./shipping.js";

const rootDir = process.cwd();
const port = Number(process.env.PORT ?? 3000);
const isProduction = process.env.APP_ENV === "production";
const allowedOrigins = (process.env.APP_ORIGINS ?? process.env.APP_ORIGIN ?? "http://localhost:3001")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const assetUploadDir = path.resolve(process.env.ASSET_UPLOAD_DIR ?? path.join(rootDir, "static/assets"));
const storefrontOrigin = allowedOrigins[0] ?? "http://localhost:3001";

function requireProductionSecret(name: string, minimumLength: number): string {
  const value = process.env[name] ?? "";
  if (isProduction && (value.length < minimumLength || /replace|change|superadmin/i.test(value))) {
    throw new Error(`${name} must be a non-default secret of at least ${minimumLength} characters in production`);
  }
  return value;
}

const cookieSecret = requireProductionSecret("COOKIE_SECRET", 32) || "danya-local-cookie-secret-change-before-production";
const superadminPassword = requireProductionSecret("SUPERADMIN_PASSWORD", 16) || "danya-local-admin-password";
const smtpHost = process.env.SMTP_HOST ?? "";
const smtpUser = process.env.SMTP_USER ?? "";

for (const origin of allowedOrigins) {
  const url = new URL(origin);
  if (isProduction && url.protocol !== "https:") throw new Error("APP_ORIGINS must contain HTTPS origins in production");
}
if (isProduction && (!smtpHost || !smtpUser)) throw new Error("SMTP_HOST and SMTP_USER are required in production");
if (isProduction && process.env.DB_SYNCHRONIZE === "true") throw new Error("DB_SYNCHRONIZE must be false in production; run reviewed migrations instead");
if (isProduction && process.env.ALLOW_DUMMY_PAYMENTS === "true") throw new Error("Dummy payments cannot be enabled in production");

const emailPlugin = isProduction
  ? EmailPlugin.init({
      handlers: defaultEmailHandlers,
      templateLoader: new FileBasedTemplateLoader(path.join(rootDir, "node_modules/@vendure/email-plugin/templates")),
      transport: {
        type: "smtp",
        host: smtpHost,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: { user: smtpUser, pass: requireProductionSecret("SMTP_PASSWORD", 8) },
      },
      globalTemplateVars: {
        fromAddress: process.env.EMAIL_FROM ?? "Danya <no-reply@dania.ir>",
        verifyEmailAddressUrl: `${storefrontOrigin}/account/verify`,
        passwordResetUrl: `${storefrontOrigin}/account/reset-password`,
        changeEmailAddressUrl: `${storefrontOrigin}/account/verify-email-change`,
      },
    })
  : EmailPlugin.init({
      devMode: true,
      route: "mailbox",
      outputPath: path.join(rootDir, "static/mailbox"),
      handlers: defaultEmailHandlers,
      templateLoader: new FileBasedTemplateLoader(path.join(rootDir, "node_modules/@vendure/email-plugin/templates")),
      globalTemplateVars: {
        fromAddress: "Danya Local <no-reply@localhost>",
        verifyEmailAddressUrl: `${storefrontOrigin}/account/verify`,
        passwordResetUrl: `${storefrontOrigin}/account/reset-password`,
        changeEmailAddressUrl: `${storefrontOrigin}/account/verify-email-change`,
      },
    });

export const config: VendureConfig = {
  defaultLanguageCode: LanguageCode.fa,
  apiOptions: {
    port,
    adminApiPath: "admin-api",
    shopApiPath: "shop-api",
    trustProxy: isProduction ? 1 : false,
    adminApiPlayground: !isProduction,
    adminApiDebug: !isProduction,
    shopApiPlayground: !isProduction,
    shopApiDebug: !isProduction,
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  },
  authOptions: {
    tokenMethod: ["bearer", "cookie"],
    cookieOptions: {
      secret: cookieSecret,
      sameSite: "lax",
      secure: isProduction,
    },
    superadminCredentials: {
      identifier: process.env.SUPERADMIN_USERNAME ?? "superadmin",
      password: superadminPassword,
    },
    requireVerification: isProduction,
  },
  dbConnectionOptions: {
    type: "postgres",
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USERNAME ?? "danya",
    password: process.env.DB_PASSWORD ?? "danya",
    database: process.env.DB_NAME ?? "danya",
    synchronize: process.env.DB_SYNCHRONIZE === "true",
    migrations: [path.join(rootDir, "dist/migrations/*.js"), path.join(rootDir, "src/migrations/*.ts")],
    logging: false,
  },
  paymentOptions: {
    paymentMethodHandlers: [dummyPaymentHandler],
  },
  shippingOptions: {
    shippingEligibilityCheckers: [defaultShippingEligibilityChecker],
    shippingCalculators: [defaultShippingCalculator, danyaStandardShippingCalculator],
  },
  importExportOptions: {
    importAssetsDir: path.resolve(process.env.IMPORT_ASSETS_DIR ?? path.join(rootDir, "import-assets")),
  },
  plugins: [
    AssetServerPlugin.init({
      route: "assets",
      assetUploadDir,
      assetUrlPrefix: process.env.ASSET_URL_PREFIX ?? `http://localhost:${port}/assets/`,
    }),
    DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }),
    DefaultSearchPlugin.init({ bufferUpdates: false, indexStockStatus: true }),
    DashboardPlugin.init({ route: "dashboard", appDir: path.join(rootDir, "dist/dashboard") }),
    emailPlugin,
    ...(isProduction ? [HardenPlugin.init({ maxQueryComplexity: 650, apiMode: "prod" })] : []),
  ],
};
