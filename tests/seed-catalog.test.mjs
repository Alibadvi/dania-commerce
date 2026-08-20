import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const csv = readFileSync(new URL("../backend/seed-data/products.csv", import.meta.url), "utf8");
const rows = csv
  .trim()
  .split(/\r?\n/)
  .slice(1)
  .map((line) => line.split(","));

test("seed catalog uses product-scoped size groups with unique variants", () => {
  const productRows = rows.filter(([name]) => name.length > 0);
  const skus = rows.map((columns) => columns[7]);
  const csvPrices = rows.map((columns) => Number(columns[8]));
  const storedPrices = csvPrices.map((price) => price * 100);

  assert.equal(productRows.length, 8);
  assert.equal(rows.length, 44);
  assert.equal(new Set(skus).size, 44);
  assert.ok(productRows.every((columns) => columns[5] === "سایز"));
  assert.ok(rows.every((columns) => /^\d+$/.test(columns[6])));
  assert.ok(skus.every((sku) => /^DAN-[A-Z]{2}-\d+$/.test(sku)));
  assert.ok(csvPrices.every((price) => Number.isInteger(price) && price >= 100_000 && price < 1_000_000));
  assert.ok(storedPrices.every((price) => Number.isSafeInteger(price) && price <= 100_000_000));
  assert.equal(csvPrices[0], 189_000);
  assert.ok(csvPrices.includes(235_000));
});
