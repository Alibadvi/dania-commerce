import { NextRequest, NextResponse } from "next/server";
import { presentationForSlug } from "@/lib/catalog";
import { rialToToman } from "@/lib/vendure";
import { splitFullName, validateCheckoutInput, validateCustomerAddressInput, validateCustomerProfileInput, validateEntityId, validateLoginInput, validatePasswordChangeInput, validateQuantity, validateRegisterInput, ValidationError } from "@/lib/checkout-validation";
import type { CartOrder, CheckoutResult, CommerceErrorPayload, CustomerAccount, CustomerAddress, CustomerDashboard, CustomerOrder, ShippingMethod } from "@/lib/commerce-types";

const SESSION_COOKIE = "danya-commerce-session";
const MAX_BODY_BYTES = 20_000;
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 120;
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

const ORDER_FIELDS = `
  id code state active totalQuantity subTotalWithTax shippingWithTax totalWithTax currencyCode
  lines {
    id quantity unitPriceWithTax discountedLinePriceWithTax
    productVariant {
      id name
      options { code name }
      product { id name slug }
    }
  }
`;

type GraphQLPayload<T> = { data?: T; errors?: Array<{ message: string }> };
type ErrorResult = { __typename: string; errorCode?: string; message?: string };
type RawOrder = {
  id: string;
  code: string;
  state: string;
  active: boolean;
  totalQuantity: number;
  subTotalWithTax: number;
  shippingWithTax: number;
  totalWithTax: number;
  currencyCode: string;
  lines: Array<{
    id: string;
    quantity: number;
    unitPriceWithTax: number;
    discountedLinePriceWithTax: number;
    productVariant: {
      id: string;
      name: string;
      options: Array<{ code: string; name: string }>;
      product: { id: string; name: string; slug: string };
    };
  }>;
};
type RawCustomerAddress = CustomerAddress & { country?: { code: string; name: string } | null };
type RawCustomerOrder = {
  id: string;
  code: string;
  state: string;
  orderPlacedAt?: string | null;
  totalWithTax: number;
  totalQuantity: number;
  lines: Array<{
    id: string;
    quantity: number;
    productVariant: { name: string; product: { name: string; slug: string } };
  }>;
};
type RawCustomerDashboard = CustomerAccount & {
  addresses?: RawCustomerAddress[] | null;
  orders: { items: RawCustomerOrder[]; totalItems: number };
};

class CommerceError extends Error {
  constructor(readonly code: string, message: string, readonly status = 400) {
    super(message);
  }
}

class VendureSession {
  private token?: string;
  private tokenChanged = false;
  private tokenCleared = false;
  private readonly endpoint: string;

  constructor(private readonly request: NextRequest) {
    const endpoint = process.env.VENDURE_SHOP_API_URL?.trim();
    if (!endpoint) throw new CommerceError("COMMERCE_UNAVAILABLE", "سرویس فروشگاه هنوز به این محیط متصل نشده است.", 503);
    try {
      const url = new URL(endpoint);
      if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("Unsupported protocol");
      this.endpoint = url.toString();
    } catch {
      throw new CommerceError("INVALID_COMMERCE_URL", "نشانی سرویس فروشگاه معتبر نیست.", 500);
    }
    const savedToken = request.cookies.get(SESSION_COOKIE)?.value;
    if (savedToken && savedToken.length <= 2048) this.token = savedToken;
  }

  async query<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
    let response: Response;
    try {
      response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-vendure-language-code": "fa",
          ...(process.env.VENDURE_CHANNEL_TOKEN ? { "vendure-token": process.env.VENDURE_CHANNEL_TOKEN } : {}),
          ...(this.token ? { authorization: `Bearer ${this.token}` } : {}),
        },
        body: JSON.stringify({ query, variables }),
        cache: "no-store",
        signal: AbortSignal.timeout(8_000),
      });
    } catch {
      throw new CommerceError("COMMERCE_OFFLINE", "ارتباط با سرویس فروشگاه برقرار نشد. دوباره تلاش کنید.", 503);
    }

    const nextToken = response.headers.get("vendure-auth-token");
    if (nextToken && nextToken.length <= 2048 && nextToken !== this.token) {
      this.token = nextToken;
      this.tokenChanged = true;
    }

    let payload: GraphQLPayload<T>;
    try {
      payload = await response.json() as GraphQLPayload<T>;
    } catch {
      throw new CommerceError("INVALID_COMMERCE_RESPONSE", "پاسخ سرویس فروشگاه قابل خواندن نیست.", 502);
    }
    if (!response.ok || payload.errors?.length || !payload.data) {
      throw new CommerceError("COMMERCE_REQUEST_FAILED", payload.errors?.[0]?.message ?? "درخواست فروشگاه انجام نشد.", 502);
    }
    return payload.data;
  }

  clear(): void {
    this.token = undefined;
    this.tokenCleared = true;
    this.tokenChanged = false;
  }

  json<T>(value: T, status = 200): NextResponse<T> {
    const response = NextResponse.json(value, { status });
    response.headers.set("cache-control", "no-store, max-age=0");
    if (this.tokenChanged && this.token) {
      response.cookies.set(SESSION_COOKIE, this.token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.APP_ENV === "production" || this.request.nextUrl.protocol === "https:",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    } else if (this.tokenCleared) {
      response.cookies.set(SESSION_COOKIE, "", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.APP_ENV === "production" || this.request.nextUrl.protocol === "https:",
        path: "/",
        maxAge: 0,
      });
    }
    return response;
  }
}

function mapOrder(order: RawOrder): CartOrder {
  return {
    id: order.id,
    code: order.code,
    state: order.state,
    active: order.active,
    totalQuantity: order.totalQuantity,
    subTotal: rialToToman(order.subTotalWithTax),
    shipping: rialToToman(order.shippingWithTax),
    total: rialToToman(order.totalWithTax),
    currencyCode: order.currencyCode,
    lines: order.lines.map((line) => {
      const option = line.productVariant.options.find((item) => item.code.startsWith("size-") || /^\d+$/.test(item.name));
      const size = Number(option?.name ?? option?.code.replace(/^size-/, ""));
      const presentation = presentationForSlug(line.productVariant.product.slug);
      return {
        id: line.id,
        quantity: line.quantity,
        variantId: line.productVariant.id,
        productId: line.productVariant.product.id,
        productName: line.productVariant.product.name,
        productSlug: line.productVariant.product.slug,
        variantName: line.productVariant.name,
        size: Number.isFinite(size) ? size : 0,
        unitPrice: rialToToman(line.unitPriceWithTax),
        linePrice: rialToToman(line.discountedLinePriceWithTax),
        imagePosition: presentation?.imagePosition ?? "top-left",
      };
    }),
  };
}

function requireOrder(result: RawOrder | ErrorResult | null | undefined): RawOrder {
  if (!result) throw new CommerceError("NO_ACTIVE_ORDER", "سبد خرید فعالی پیدا نشد.", 404);
  if ((result as ErrorResult).__typename && (result as ErrorResult).__typename !== "Order") {
    const error = result as ErrorResult;
    throw new CommerceError(error.errorCode ?? error.__typename, error.message ?? "امکان به‌روزرسانی سفارش نیست.");
  }
  return result as RawOrder;
}

function assertSameOrigin(request: NextRequest): void {
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    throw new CommerceError("CROSS_SITE_REQUEST", "درخواست بین‌سایتی مجاز نیست.", 403);
  }
  const origin = request.headers.get("origin");
  if (!origin) return;
  const expectedHost = (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? request.nextUrl.host).split(",")[0].trim();
  try {
    if (new URL(origin).host !== expectedHost) throw new Error("Origin mismatch");
  } catch {
    throw new CommerceError("ORIGIN_MISMATCH", "مبدأ درخواست معتبر نیست.", 403);
  }
}

function assertRateLimit(request: NextRequest, limit = RATE_LIMIT, scope = "commerce"): void {
  const now = Date.now();
  const address = request.headers.get("cf-connecting-ip")
    ?? request.headers.get("x-forwarded-for")?.split(",")[0].trim()
    ?? "local";
  const key = `${scope}:${address}`;
  const current = rateBuckets.get(key);
  if (!current || current.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
  } else {
    current.count += 1;
    if (current.count > limit) throw new CommerceError("RATE_LIMITED", "درخواست‌ها بیش از حد سریع هستند؛ یک دقیقه دیگر تلاش کنید.", 429);
  }
  if (rateBuckets.size > 5_000) {
    for (const [key, bucket] of rateBuckets) if (bucket.resetAt <= now) rateBuckets.delete(key);
  }
}

async function parseBody(request: NextRequest): Promise<Record<string, unknown>> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    throw new CommerceError("UNSUPPORTED_MEDIA_TYPE", "فقط درخواست JSON پذیرفته می‌شود.", 415);
  }
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) throw new CommerceError("PAYLOAD_TOO_LARGE", "حجم درخواست بیش از حد مجاز است.", 413);
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) throw new CommerceError("PAYLOAD_TOO_LARGE", "حجم درخواست بیش از حد مجاز است.", 413);
  try {
    const value = JSON.parse(raw) as unknown;
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid body");
    return value as Record<string, unknown>;
  } catch {
    throw new CommerceError("INVALID_JSON", "ساختار درخواست معتبر نیست.");
  }
}

function errorResponse(error: unknown): NextResponse<CommerceErrorPayload> {
  if (error instanceof ValidationError) {
    return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: 422 });
  }
  if (error instanceof CommerceError) {
    return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: error.status });
  }
  return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "خطای پیش‌بینی‌نشده‌ای رخ داد." } }, { status: 500 });
}

async function activeOrder(session: VendureSession): Promise<CartOrder | null> {
  const data = await session.query<{ activeOrder: RawOrder | null }>(`query ActiveOrder { activeOrder { ${ORDER_FIELDS} } }`);
  return data.activeOrder ? mapOrder(data.activeOrder) : null;
}

async function eligibleShipping(session: VendureSession): Promise<ShippingMethod[]> {
  const data = await session.query<{ eligibleShippingMethods: Array<{ id: string; code: string; name: string; description: string; price: number; priceWithTax: number; metadata?: Record<string, unknown> | null }> }>(`
    query EligibleShippingMethods {
      eligibleShippingMethods { id code name description price priceWithTax metadata }
    }
  `);
  return data.eligibleShippingMethods.map((method) => ({
    ...method,
    price: rialToToman(method.price),
    priceWithTax: rialToToman(method.priceWithTax),
  }));
}

async function activeCustomer(session: VendureSession): Promise<CustomerAccount | null> {
  const data = await session.query<{ activeCustomer: CustomerAccount | null }>(`
    query ActiveCustomer {
      activeCustomer { id firstName lastName emailAddress phoneNumber }
    }
  `);
  return data.activeCustomer;
}

function mapCustomerOrder(order: RawCustomerOrder): CustomerOrder {
  return {
    id: order.id,
    code: order.code,
    state: order.state,
    orderPlacedAt: order.orderPlacedAt,
    total: rialToToman(order.totalWithTax),
    totalQuantity: order.totalQuantity,
    lines: order.lines.map((line) => ({
      id: line.id,
      quantity: line.quantity,
      productName: line.productVariant.product.name,
      productSlug: line.productVariant.product.slug,
      variantName: line.productVariant.name,
    })),
  };
}

async function activeCustomerDashboard(session: VendureSession): Promise<CustomerDashboard | null> {
  const data = await session.query<{ activeCustomer: RawCustomerDashboard | null }>(`
    query CustomerDashboard {
      activeCustomer {
        id firstName lastName emailAddress phoneNumber
        addresses {
          id fullName streetLine1 streetLine2 city province postalCode phoneNumber
          defaultShippingAddress defaultBillingAddress
        }
        orders(options: { take: 20, sort: { orderPlacedAt: DESC } }) {
          totalItems
          items {
            id code state orderPlacedAt totalWithTax totalQuantity
            lines { id quantity productVariant { name product { name slug } } }
          }
        }
      }
    }
  `);
  if (!data.activeCustomer) return null;
  const { addresses, orders, ...customer } = data.activeCustomer;
  return {
    customer,
    addresses: addresses ?? [],
    orders: orders.items.map(mapCustomerOrder),
    totalOrders: orders.totalItems,
  };
}

async function requireCustomer(session: VendureSession): Promise<CustomerAccount> {
  const customer = await activeCustomer(session);
  if (!customer) throw new CommerceError("AUTHENTICATION_REQUIRED", "برای انجام این کار وارد حساب شوید.", 401);
  return customer;
}

async function finalizePayment(session: VendureSession, preparedOrder: RawOrder): Promise<CheckoutResult> {
  const dummyAllowed = process.env.ALLOW_DUMMY_PAYMENTS === "true" && process.env.APP_ENV !== "production";
  if (!dummyAllowed) return { order: mapOrder(preparedOrder), paymentMode: "provider-required" };
  const paymentData = await session.query<{ addPaymentToOrder: RawOrder | ErrorResult }>(`
    mutation AddDevelopmentPayment($input: PaymentInput!) {
      addPaymentToOrder(input: $input) {
        __typename ... on Order { ${ORDER_FIELDS} } ... on ErrorResult { errorCode message }
      }
    }
  `, { input: { method: "danya-development-payment", metadata: { environment: "local-test" } } });
  return { order: mapOrder(requireOrder(paymentData.addPaymentToOrder)), paymentMode: "dummy" };
}

export async function GET(request: NextRequest) {
  try {
    assertRateLimit(request);
    const session = new VendureSession(request);
    const resource = request.nextUrl.searchParams.get("resource") ?? "cart";
    if (resource === "cart") return session.json({ order: await activeOrder(session) });
    if (resource === "shipping") return session.json({ methods: await eligibleShipping(session) });
    if (resource === "account") {
      const dashboard = await activeCustomerDashboard(session);
      return session.json({ customer: dashboard?.customer ?? null, dashboard });
    }
    throw new CommerceError("UNKNOWN_RESOURCE", "درخواست شناخته نشد.", 404);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    assertRateLimit(request);
    assertSameOrigin(request);
    const body = await parseBody(request);
    const action = typeof body.action === "string" ? body.action : "";
    if (action.startsWith("auth.") || action.startsWith("account.")) assertRateLimit(request, 10, "account");
    const session = new VendureSession(request);

    if (action === "auth.login") {
      const input = validateLoginInput(body.credentials);
      const data = await session.query<{ login: { __typename: string; id?: string; identifier?: string; errorCode?: string; message?: string } }>(`
        mutation Login($username: String!, $password: String!) {
          login(username: $username, password: $password, rememberMe: true) {
            __typename
            ... on CurrentUser { id identifier }
            ... on ErrorResult { errorCode message }
          }
        }
      `, { username: input.emailAddress, password: input.password });
      if (data.login.__typename !== "CurrentUser") {
        throw new CommerceError(data.login.errorCode ?? "LOGIN_FAILED", "ایمیل یا رمز عبور درست نیست.", 401);
      }
      return session.json({ customer: await activeCustomer(session) });
    }

    if (action === "auth.register") {
      const input = validateRegisterInput(body.customer);
      const data = await session.query<{ registerCustomerAccount: { __typename: string; success?: boolean; errorCode?: string; message?: string } }>(`
        mutation Register($input: RegisterCustomerInput!) {
          registerCustomerAccount(input: $input) {
            __typename
            ... on Success { success }
            ... on ErrorResult { errorCode message }
          }
        }
      `, { input });
      if (data.registerCustomerAccount.__typename !== "Success") {
        throw new CommerceError(data.registerCustomerAccount.errorCode ?? "REGISTRATION_FAILED", data.registerCustomerAccount.message ?? "ساخت حساب انجام نشد.");
      }
      return session.json({ registered: true });
    }

    if (action === "auth.logout") {
      await session.query<{ logout: { success: boolean } }>(`mutation Logout { logout { success } }`);
      session.clear();
      return session.json({ customer: null });
    }

    if (action === "account.profile.update") {
      const input = validateCustomerProfileInput(body.customer);
      await requireCustomer(session);
      await session.query<{ updateCustomer: CustomerAccount }>(`
        mutation UpdateCustomerProfile($input: UpdateCustomerInput!) {
          updateCustomer(input: $input) { id firstName lastName emailAddress phoneNumber }
        }
      `, { input });
      return session.json({ dashboard: await activeCustomerDashboard(session) });
    }

    if (action === "account.password.update") {
      const input = validatePasswordChangeInput(body.passwords);
      await requireCustomer(session);
      const data = await session.query<{ updateCustomerPassword: { __typename: string; success?: boolean; errorCode?: string; message?: string } }>(`
        mutation UpdateCustomerPassword($currentPassword: String!, $newPassword: String!) {
          updateCustomerPassword(currentPassword: $currentPassword, newPassword: $newPassword) {
            __typename
            ... on Success { success }
            ... on ErrorResult { errorCode message }
          }
        }
      `, input);
      if (data.updateCustomerPassword.__typename !== "Success") {
        const invalid = data.updateCustomerPassword.__typename === "InvalidCredentialsError";
        throw new CommerceError(
          data.updateCustomerPassword.errorCode ?? "PASSWORD_UPDATE_FAILED",
          invalid ? "رمز عبور فعلی درست نیست." : data.updateCustomerPassword.message ?? "تغییر رمز عبور انجام نشد.",
          invalid ? 401 : 400,
        );
      }
      return session.json({ changed: true });
    }

    if (action === "account.address.create") {
      const input = validateCustomerAddressInput(body.address);
      await requireCustomer(session);
      await session.query<{ createCustomerAddress: RawCustomerAddress }>(`
        mutation CreateCustomerAddress($input: CreateAddressInput!) {
          createCustomerAddress(input: $input) { id }
        }
      `, { input: { ...input, countryCode: "IR", defaultBillingAddress: input.defaultShippingAddress } });
      return session.json({ dashboard: await activeCustomerDashboard(session) });
    }

    if (action === "account.address.update") {
      const input = validateCustomerAddressInput(body.address, true);
      await requireCustomer(session);
      await session.query<{ updateCustomerAddress: RawCustomerAddress }>(`
        mutation UpdateCustomerAddress($input: UpdateAddressInput!) {
          updateCustomerAddress(input: $input) { id }
        }
      `, { input: { ...input, countryCode: "IR", defaultBillingAddress: input.defaultShippingAddress } });
      return session.json({ dashboard: await activeCustomerDashboard(session) });
    }

    if (action === "account.address.delete") {
      const addressId = validateEntityId(body.addressId, "آدرس");
      await requireCustomer(session);
      await session.query<{ deleteCustomerAddress: { success: boolean } }>(`
        mutation DeleteCustomerAddress($id: ID!) {
          deleteCustomerAddress(id: $id) { success }
        }
      `, { id: addressId });
      return session.json({ dashboard: await activeCustomerDashboard(session) });
    }

    if (action === "cart.add") {
      const productVariantId = validateEntityId(body.productVariantId, "تنوع محصول");
      const quantity = validateQuantity(body.quantity ?? 1);
      if (quantity < 1) throw new ValidationError("تعداد افزودن باید حداقل یک باشد.");
      const data = await session.query<{ addItemToOrder: RawOrder | ErrorResult }>(`
        mutation AddItem($productVariantId: ID!, $quantity: Int!) {
          addItemToOrder(productVariantId: $productVariantId, quantity: $quantity) {
            __typename ... on Order { ${ORDER_FIELDS} } ... on ErrorResult { errorCode message }
          }
        }
      `, { productVariantId, quantity });
      return session.json({ order: mapOrder(requireOrder(data.addItemToOrder)) });
    }

    if (action === "cart.adjust") {
      const orderLineId = validateEntityId(body.orderLineId, "ردیف سفارش");
      const quantity = validateQuantity(body.quantity);
      const data = await session.query<{ adjustOrderLine: RawOrder | ErrorResult }>(`
        mutation AdjustLine($orderLineId: ID!, $quantity: Int!) {
          adjustOrderLine(orderLineId: $orderLineId, quantity: $quantity) {
            __typename ... on Order { ${ORDER_FIELDS} } ... on ErrorResult { errorCode message }
          }
        }
      `, { orderLineId, quantity });
      return session.json({ order: mapOrder(requireOrder(data.adjustOrderLine)) });
    }

    if (action === "cart.remove") {
      const orderLineId = validateEntityId(body.orderLineId, "ردیف سفارش");
      const data = await session.query<{ removeOrderLine: RawOrder | ErrorResult }>(`
        mutation RemoveLine($orderLineId: ID!) {
          removeOrderLine(orderLineId: $orderLineId) {
            __typename ... on Order { ${ORDER_FIELDS} } ... on ErrorResult { errorCode message }
          }
        }
      `, { orderLineId });
      return session.json({ order: mapOrder(requireOrder(data.removeOrderLine)) });
    }

    if (action === "cart.coupon") {
      const couponCode = typeof body.couponCode === "string" ? body.couponCode.trim().toUpperCase() : "";
      if (!/^[A-Z0-9_-]{3,32}$/.test(couponCode)) throw new ValidationError("کد تخفیف معتبر نیست.");
      const data = await session.query<{ applyCouponCode: RawOrder | ErrorResult }>(`
        mutation ApplyCoupon($couponCode: String!) {
          applyCouponCode(couponCode: $couponCode) {
            __typename ... on Order { ${ORDER_FIELDS} } ... on ErrorResult { errorCode message }
          }
        }
      `, { couponCode });
      return session.json({ order: mapOrder(requireOrder(data.applyCouponCode)) });
    }

    if (action === "checkout.place") {
      const input = validateCheckoutInput(body.checkout);
      const order = await activeOrder(session);
      if (!order?.lines.length) throw new CommerceError("EMPTY_ORDER", "سبد خرید خالی است.");
      if (order.state === "ArrangingPayment") {
        const currentData = await session.query<{ activeOrder: RawOrder | null }>(`query CurrentPaymentOrder { activeOrder { ${ORDER_FIELDS} } }`);
        return session.json<CheckoutResult>(await finalizePayment(session, requireOrder(currentData.activeOrder)));
      }
      const customer = await activeCustomer(session);

      // Vendure automatically owns an authenticated customer's active order.
      // setCustomerForOrder is only valid for guest orders and explicitly
      // rejects attempts to replace the customer of a logged-in order.
      if (!customer) {
        const { firstName, lastName } = splitFullName(input.fullName);
        const customerData = await session.query<{ setCustomerForOrder: RawOrder | ErrorResult }>(`
          mutation SetCustomer($input: CreateCustomerInput!) {
            setCustomerForOrder(input: $input) {
              __typename ... on Order { id } ... on ErrorResult { errorCode message }
            }
          }
        `, { input: { firstName, lastName, emailAddress: input.emailAddress, phoneNumber: input.phoneNumber } });
        requireOrder(customerData.setCustomerForOrder);
      }

      const addressData = await session.query<{ setOrderShippingAddress: RawOrder | ErrorResult }>(`
        mutation SetShippingAddress($input: CreateAddressInput!) {
          setOrderShippingAddress(input: $input) {
            __typename ... on Order { id } ... on ErrorResult { errorCode message }
          }
        }
      `, { input: {
        fullName: input.fullName,
        streetLine1: input.streetLine1,
        streetLine2: input.orderNote ? `یادداشت سفارش: ${input.orderNote}` : undefined,
        city: input.city,
        province: input.province,
        postalCode: input.postalCode,
        countryCode: "IR",
        phoneNumber: input.phoneNumber,
      } });
      requireOrder(addressData.setOrderShippingAddress);

      const shippingMethods = await eligibleShipping(session);
      if (!shippingMethods.some((method) => method.id === input.shippingMethodId)) {
        throw new CommerceError("INELIGIBLE_SHIPPING_METHOD", "روش ارسال انتخاب‌شده برای این سفارش در دسترس نیست.");
      }
      const shippingData = await session.query<{ setOrderShippingMethod: RawOrder | ErrorResult }>(`
        mutation SetShipping($shippingMethodId: [ID!]!) {
          setOrderShippingMethod(shippingMethodId: $shippingMethodId) {
            __typename ... on Order { id } ... on ErrorResult { errorCode message }
          }
        }
      `, { shippingMethodId: [input.shippingMethodId] });
      requireOrder(shippingData.setOrderShippingMethod);

      const transitionData = await session.query<{ transitionOrderToState: RawOrder | ErrorResult | null }>(`
        mutation ArrangePayment { transitionOrderToState(state: "ArrangingPayment") {
          __typename ... on Order { ${ORDER_FIELDS} } ... on ErrorResult { errorCode message }
        } }
      `);
      return session.json<CheckoutResult>(await finalizePayment(session, requireOrder(transitionData.transitionOrderToState)));
    }

    throw new CommerceError("UNKNOWN_ACTION", "عملیات شناخته نشد.", 404);
  } catch (error) {
    return errorResponse(error);
  }
}
