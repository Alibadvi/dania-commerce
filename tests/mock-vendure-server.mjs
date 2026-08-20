import http from "node:http";

const port = Number(process.env.MOCK_VENDURE_PORT ?? 4010);
const sessions = new Map();
const customers = new Map();
let sessionCounter = 0;

const catalog = [
  ["1", "roshan-blue", "روشن آبی", "کتانی سبک روزمره", "پسرانه", "آبی", 18900000, [26, 27, 28, 29, 30, 31]],
  ["2", "naranj-sunset", "نارنج غروب", "کتانی نرم و منعطف", "دخترانه", "مرجانی", 21400000, [25, 26, 27, 28, 29]],
  ["3", "sabz-park", "سبز پارک", "کفش بازی مقاوم", "پسرانه", "سبز", 23500000, [28, 29, 30, 31, 32, 33]],
  ["4", "yas-pink", "یاس صورتی", "کتانی راحت شهری", "دخترانه", "صورتی", 19800000, [26, 27, 28, 29, 30]],
  ["5", "abr-cream", "ابر کرم", "کفش اولین قدم", "نوزادی", "کرم", 14600000, [20, 21, 22, 23, 24]],
  ["6", "darya-navy", "دریا سرمه‌ای", "کتانی مدرسه و روزمره", "پسرانه", "سرمه‌ای", 22500000, [29, 30, 31, 32, 33, 34]],
  ["7", "shafagh-lilac", "شفق یاسی", "کتانی سبک پیاده‌روی", "دخترانه", "یاسی", 20700000, [27, 28, 29, 30, 31, 32]],
  ["8", "aftab-yellow", "آفتاب زرد", "کفش بازی تابستانی", "نوزادی", "زرد", 16900000, [21, 22, 23, 24, 25]],
].map(([id, slug, name, description, category, color, price, sizes]) => ({
  id, slug, name, description,
  featuredAsset: { preview: `http://127.0.0.1:${port}/assets/danya-catalog-grid.png` },
  facetValues: [
    { code: String(category), name: String(category), facet: { code: "category" } },
    { code: String(color), name: String(color), facet: { code: "color" } },
  ],
  variants: sizes.map((size) => ({
    id: `${id}-${size}`,
    name: `${name} / ${size}`,
    priceWithTax: price,
    currencyCode: "IRR",
    stockLevel: "IN_STOCK",
    options: [{ code: `size-${size}`, name: String(size) }],
  })),
}));

function getToken(request) {
  return request.headers.authorization?.replace(/^Bearer\s+/i, "");
}

function getSession(request, response, create = false) {
  let token = getToken(request);
  if (!token && create) {
    token = `mock-session-${++sessionCounter}`;
    sessions.set(token, { code: `TST-${1000 + sessionCounter}`, state: "AddingItems", active: true, lines: [], shippingCode: null, coupon: null });
    response.setHeader("vendure-auth-token", token);
  }
  return token ? sessions.get(token) : undefined;
}

function findVariant(id) {
  for (const product of catalog) {
    const variant = product.variants.find((item) => item.id === id);
    if (variant) return { product, variant };
  }
  return undefined;
}

function rawOrder(session) {
  const discount = session.coupon === "DANYA10" ? 0.9 : 1;
  const lines = session.lines.map((line) => {
    const found = findVariant(line.variantId);
    const linePrice = Math.round(found.variant.priceWithTax * line.quantity * discount);
    return {
      id: line.id,
      quantity: line.quantity,
      unitPriceWithTax: found.variant.priceWithTax,
      discountedLinePriceWithTax: linePrice,
      productVariant: {
        id: found.variant.id,
        name: found.variant.name,
        options: found.variant.options,
        product: { id: found.product.id, name: found.product.name, slug: found.product.slug },
      },
    };
  });
  const subTotalWithTax = lines.reduce((sum, line) => sum + line.discountedLinePriceWithTax, 0);
  const shippingWithTax = session.shippingCode === "express" ? 1200000 : session.shippingCode === "standard" && subTotalWithTax < 20000000 ? 690000 : 0;
  return {
    __typename: "Order",
    id: "mock-order-1",
    code: session.code,
    state: session.state,
    active: session.active,
    totalQuantity: lines.reduce((sum, line) => sum + line.quantity, 0),
    subTotalWithTax,
    shippingWithTax,
    totalWithTax: subTotalWithTax + shippingWithTax,
    currencyCode: "IRR",
    lines,
  };
}

function send(response, data, status = 200) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8", ...response.getHeaders() });
  response.end(JSON.stringify({ data }));
}

const server = http.createServer((request, response) => {
  if (request.method !== "POST" || request.url !== "/shop-api") {
    response.writeHead(404).end();
    return;
  }
  let raw = "";
  request.on("data", (chunk) => { raw += chunk; });
  request.on("end", () => {
    const { query = "", variables = {} } = JSON.parse(raw || "{}");
    if (query.includes("DanyaProducts")) return send(response, { products: { items: catalog } });
    if (query.includes("DanyaProduct(")) return send(response, { product: catalog.find((item) => item.slug === variables.slug) ?? null });
    if (query.includes("Register(")) {
      if (customers.has(variables.input.emailAddress)) return send(response, { registerCustomerAccount: { __typename: "IdentifierChangeTokenInvalidError", errorCode: "EMAIL_ADDRESS_CONFLICT_ERROR", message: "این ایمیل قبلاً ثبت شده است." } });
      customers.set(variables.input.emailAddress, { id: `customer-${customers.size + 1}`, firstName: variables.input.firstName, lastName: variables.input.lastName, emailAddress: variables.input.emailAddress, phoneNumber: null, password: variables.input.password });
      return send(response, { registerCustomerAccount: { __typename: "Success", success: true } });
    }
    if (query.includes("mutation Login")) {
      const customer = customers.get(variables.username);
      if (!customer || customer.password !== variables.password) return send(response, { login: { __typename: "InvalidCredentialsError", errorCode: "INVALID_CREDENTIALS_ERROR", message: "Invalid credentials" } });
      const token = `mock-session-${++sessionCounter}`;
      sessions.set(token, { code: `TST-${1000 + sessionCounter}`, state: "AddingItems", active: true, lines: [], shippingCode: null, coupon: null, customer });
      response.setHeader("vendure-auth-token", token);
      return send(response, { login: { __typename: "CurrentUser", id: customer.id, identifier: customer.emailAddress } });
    }
    if (query.includes("eligibleShippingMethods")) {
      const session = getSession(request, response);
      const subtotal = session ? rawOrder(session).subTotalWithTax : 0;
      return send(response, { eligibleShippingMethods: [
        { id: "standard", code: "danya-standard", name: "ارسال استاندارد", description: "۲ تا ۴ روز کاری", price: subtotal >= 20000000 ? 0 : 690000, priceWithTax: subtotal >= 20000000 ? 0 : 690000, metadata: { estimatedDaysMin: 2, estimatedDaysMax: 4 } },
        { id: "express", code: "danya-express-tehran", name: "ارسال سریع تهران", description: "همان روز یا روز کاری بعد", price: 1200000, priceWithTax: 1200000, metadata: { estimatedDaysMin: 0, estimatedDaysMax: 1 } },
      ] });
    }
    if (query.includes("addItemToOrder")) {
      const session = getSession(request, response, true);
      const existing = session.lines.find((line) => line.variantId === variables.productVariantId);
      if (existing) existing.quantity += variables.quantity;
      else session.lines.push({ id: `line-${session.lines.length + 1}`, variantId: variables.productVariantId, quantity: variables.quantity });
      return send(response, { addItemToOrder: rawOrder(session) });
    }
    const session = getSession(request, response);
    if (query.includes("ActiveCustomer")) return send(response, { activeCustomer: session?.customer ? { id: session.customer.id, firstName: session.customer.firstName, lastName: session.customer.lastName, emailAddress: session.customer.emailAddress, phoneNumber: session.customer.phoneNumber } : null });
    if (query.includes("mutation Logout")) {
      if (session) sessions.delete(getToken(request));
      return send(response, { logout: { success: true } });
    }
    if (query.includes("ActiveOrder") || query.includes("CurrentPaymentOrder")) return send(response, { activeOrder: session?.active ? rawOrder(session) : null });
    if (!session) return send(response, {}, 401);
    if (query.includes("adjustOrderLine")) {
      const line = session.lines.find((item) => item.id === variables.orderLineId);
      if (variables.quantity === 0) session.lines = session.lines.filter((item) => item.id !== variables.orderLineId);
      else if (line) line.quantity = variables.quantity;
      return send(response, { adjustOrderLine: rawOrder(session) });
    }
    if (query.includes("removeOrderLine")) {
      session.lines = session.lines.filter((item) => item.id !== variables.orderLineId);
      return send(response, { removeOrderLine: rawOrder(session) });
    }
    if (query.includes("applyCouponCode")) {
      if (variables.couponCode !== "DANYA10") return send(response, { applyCouponCode: { __typename: "CouponCodeInvalidError", errorCode: "COUPON_CODE_INVALID", message: "کد تخفیف معتبر نیست." } });
      session.coupon = variables.couponCode;
      return send(response, { applyCouponCode: rawOrder(session) });
    }
    if (query.includes("setCustomerForOrder")) return send(response, { setCustomerForOrder: { __typename: "Order", id: "mock-order-1" } });
    if (query.includes("setOrderShippingAddress")) return send(response, { setOrderShippingAddress: { __typename: "Order", id: "mock-order-1" } });
    if (query.includes("setOrderShippingMethod")) {
      session.shippingCode = variables.shippingMethodId[0];
      return send(response, { setOrderShippingMethod: { __typename: "Order", id: "mock-order-1" } });
    }
    if (query.includes("transitionOrderToState")) {
      session.state = "ArrangingPayment";
      return send(response, { transitionOrderToState: rawOrder(session) });
    }
    if (query.includes("addPaymentToOrder")) {
      session.state = "PaymentSettled";
      session.active = false;
      return send(response, { addPaymentToOrder: rawOrder(session) });
    }
    return send(response, {}, 400);
  });
});

server.listen(port, "127.0.0.1", () => console.log(`Mock Vendure listening on http://127.0.0.1:${port}/shop-api`));
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.close(() => process.exit(0)));
