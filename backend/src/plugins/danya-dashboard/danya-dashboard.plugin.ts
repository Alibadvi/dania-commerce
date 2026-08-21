import { VendurePlugin } from "@vendure/core";

@VendurePlugin({
  compatibility: "^3.7.0",
  dashboard: "./dashboard/index.tsx",
})
export class DanyaDashboardPlugin {}
