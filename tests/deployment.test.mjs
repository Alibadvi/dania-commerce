import assert from "node:assert/strict";
import test from "node:test";
import { vendureShopApiUrl } from "../lib/commerce-endpoint.ts";
import { siteOrigin } from "../lib/site.ts";

function withEnvironment(values, callback) {
  const previous = Object.fromEntries(
    Object.keys(values).map((key) => [key, process.env[key]]),
  );

  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }

  try {
    callback();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test("normalizes Vendure service addresses for local and hosted deployments", () => {
  withEnvironment({ VENDURE_SHOP_API_URL: "vendure:3000" }, () => {
    assert.equal(vendureShopApiUrl(), "http://vendure:3000/shop-api");
  });

  withEnvironment({ VENDURE_SHOP_API_URL: "https://commerce.example.com/shop-api" }, () => {
    assert.equal(vendureShopApiUrl(), "https://commerce.example.com/shop-api");
  });

  withEnvironment({ VENDURE_SHOP_API_URL: "file:///tmp/store" }, () => {
    assert.equal(vendureShopApiUrl(), undefined);
  });
});

test("uses Render's external hostname when no explicit canonical URL is set", () => {
  withEnvironment(
    {
      NEXT_PUBLIC_SITE_URL: undefined,
      RENDER_EXTERNAL_HOSTNAME: "dania-storefront.example.onrender.com",
    },
    () => {
      assert.equal(siteOrigin(), "https://dania-storefront.example.onrender.com");
    },
  );
});
