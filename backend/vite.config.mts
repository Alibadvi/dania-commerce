import { vendureDashboardPlugin } from "@vendure/dashboard/vite";
import { LanguageCode } from "@vendure/core";
import { join } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/dashboard",
  build: { outDir: join(import.meta.dirname, "dist/dashboard"), emptyOutDir: false },
  plugins: [
    vendureDashboardPlugin({
      vendureConfigPath: join(import.meta.dirname, "src/vendure-config.ts"),
      i18n: {
        defaultLanguage: LanguageCode.fa,
        defaultLocale: "fa-IR",
        availableLanguages: [LanguageCode.fa],
        availableLocales: ["fa-IR"],
      },
    }),
  ],
});
