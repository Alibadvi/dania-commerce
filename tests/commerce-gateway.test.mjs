import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import test from "node:test";

const mockPort = 4011;

async function startMockVendure() {
  const child = spawn(process.execPath, ["tests/mock-vendure-server.mjs"], {
    cwd: process.cwd(),
    env: { ...process.env, MOCK_VENDURE_PORT: String(mockPort) },
    stdio: ["ignore", "pipe", "pipe"],
  });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Mock Vendure did not start")), 5_000);
    child.once("exit", (code) => reject(new Error(`Mock Vendure exited with ${code}`)));
    child.stdout.on("data", (chunk) => {
      if (String(chunk).includes("Mock Vendure listening")) {
        clearTimeout(timer);
        resolve();
      }
    });
  });
  return child;
}

test("proxies a complete Vendure cart and guest checkout session", async (t) => {
  const mock = await startMockVendure();
  t.after(() => mock.kill("SIGTERM"));
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("commerce-test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const env = {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    VENDURE_SHOP_API_URL: `http://127.0.0.1:${mockPort}/shop-api`,
    APP_ENV: "local",
    ALLOW_DUMMY_PAYMENTS: "true",
  };
  const ctx = { waitUntil() {}, passThroughOnException() {} };

  async function call(path, body, cookie) {
    const response = await worker.fetch(new Request(`http://localhost${path}`, {
      method: body ? "POST" : "GET",
      headers: {
        ...(body ? { "content-type": "application/json", origin: "http://localhost" } : {}),
        ...(cookie ? { cookie } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    }), env, ctx);
    return { response, payload: await response.json() };
  }

  const productResponse = await worker.fetch(
    new Request("http://localhost/product/roshan-blue", {
      headers: { accept: "text/html" },
    }),
    env,
    ctx,
  );
  const productHtml = await productResponse.text();
  assert.equal(productResponse.status, 200);
  assert.match(productHtml, /1-26/);
  assert.doesNotMatch(productHtml, /demo-roshan-blue-26/);

  const empty = await call("/api/commerce?resource=cart");
  assert.equal(empty.response.status, 200);
  assert.equal(empty.payload.order, null);

  const added = await call("/api/commerce", { action: "cart.add", productVariantId: "1-26", quantity: 1 });
  assert.equal(added.response.status, 200);
  assert.equal(added.payload.order.lines[0].size, 26);
  assert.equal(added.payload.order.subTotal, 1_890_000);
  const cookie = (added.response.headers.get("set-cookie") ?? "").split(";", 1)[0];
  assert.match(cookie, /^danya-commerce-session=/);
  assert.match(added.response.headers.get("set-cookie") ?? "", /HttpOnly/i);

  const registered = await call("/api/commerce", { action: "auth.register", customer: { firstName: "سارا", lastName: "احمدی", emailAddress: "sara@example.com", password: "correct-horse" } });
  assert.equal(registered.response.status, 200);
  assert.equal(registered.payload.registered, true);

  const loggedIn = await call("/api/commerce", { action: "auth.login", credentials: { emailAddress: "sara@example.com", password: "correct-horse" } });
  assert.equal(loggedIn.response.status, 200);
  assert.equal(loggedIn.payload.customer.emailAddress, "sara@example.com");
  const accountCookie = (loggedIn.response.headers.get("set-cookie") ?? "").split(";", 1)[0];
  assert.match(loggedIn.response.headers.get("set-cookie") ?? "", /HttpOnly/i);
  const account = await call("/api/commerce?resource=account", undefined, accountCookie);
  assert.equal(account.payload.customer.firstName, "سارا");

  const loggedOut = await call("/api/commerce", { action: "auth.logout" }, accountCookie);
  assert.equal(loggedOut.response.status, 200);
  assert.match(loggedOut.response.headers.get("set-cookie") ?? "", /Max-Age=0/i);

  const shipping = await call("/api/commerce?resource=shipping", undefined, cookie);
  assert.equal(shipping.response.status, 200);
  assert.equal(shipping.payload.methods[0].priceWithTax, 69_000);

  const adjusted = await call("/api/commerce", { action: "cart.adjust", orderLineId: "line-1", quantity: 2 }, cookie);
  assert.equal(adjusted.payload.order.totalQuantity, 2);
  assert.equal(adjusted.payload.order.subTotal, 3_780_000);

  const checkout = await call("/api/commerce", {
    action: "checkout.place",
    checkout: {
      fullName: "علی رضایی",
      emailAddress: "ali@example.com",
      phoneNumber: "09123456789",
      province: "تهران",
      city: "تهران",
      streetLine1: "خیابان آزادی پلاک ۱",
      postalCode: "1234567890",
      shippingMethodId: "standard",
    },
  }, cookie);
  assert.equal(checkout.response.status, 200);
  assert.equal(checkout.payload.paymentMode, "dummy");
  assert.equal(checkout.payload.order.active, false);
  assert.equal(checkout.payload.order.state, "PaymentSettled");
});
