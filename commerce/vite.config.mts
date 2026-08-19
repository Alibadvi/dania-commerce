import { vendureDashboardPlugin } from "@vendure/dashboard/vite";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/dashboard",
  build: { outDir: join(import.meta.dirname, "dist/dashboard") },
  plugins: [
    vendureDashboardPlugin({
      vendureConfigPath: pathToFileURL("./src/vendure-config.ts"),
      api: { host: process.env.VENDURE_DASHBOARD_API_HOST ?? "http://localhost", port: Number(process.env.PORT ?? 3000) },
      gqlOutputPath: "./src/gql",
    }),
  ],
  resolve: { alias: { "@/gql": resolve(import.meta.dirname, "./src/gql/graphql.ts") } },
});
