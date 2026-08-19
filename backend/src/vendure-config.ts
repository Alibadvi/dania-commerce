import "dotenv/config";
import path from "node:path";
import { AssetServerPlugin } from "@vendure/asset-server-plugin";
import {
  DefaultJobQueuePlugin,
  DefaultSearchPlugin,
  LanguageCode,
  LogLevel,
  dummyPaymentHandler,
  type VendureConfig,
} from "@vendure/core";
import { DashboardPlugin } from "@vendure/dashboard/plugin";
import { HardenPlugin } from "@vendure/harden-plugin";

const rootDir = process.cwd();
const port = Number(process.env.PORT ?? 3000);
const isProduction = process.env.NODE_ENV === "production";
const allowedOrigin = process.env.APP_ORIGIN ?? "http://localhost:3001";
const assetUploadDir = path.resolve(process.env.ASSET_UPLOAD_DIR ?? path.join(rootDir, "static/assets"));

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
      origin: [allowedOrigin],
      credentials: true,
    },
  },
  authOptions: {
    tokenMethod: ["bearer", "cookie"],
    cookieOptions: {
      secret: process.env.COOKIE_SECRET ?? "development-cookie-secret-change-me",
      sameSite: "lax",
      secure: isProduction,
    },
    superadminCredentials: {
      identifier: process.env.SUPERADMIN_USERNAME ?? "superadmin",
      password: process.env.SUPERADMIN_PASSWORD ?? "superadmin",
    },
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
  plugins: [
    AssetServerPlugin.init({
      route: "assets",
      assetUploadDir,
      assetUrlPrefix: process.env.ASSET_URL_PREFIX ?? `http://localhost:${port}/assets/`,
    }),
    DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }),
    DefaultSearchPlugin.init({ bufferUpdates: false, indexStockStatus: true }),
    DashboardPlugin.init({ route: "dashboard", appDir: path.join(rootDir, "dist/dashboard") }),
    ...(isProduction ? [HardenPlugin.init({ maxQueryComplexity: 650, apiMode: "prod" })] : []),
  ],
};
