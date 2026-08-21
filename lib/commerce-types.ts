import type { Product } from "@/lib/catalog";

export type CartLine = {
  id: string;
  quantity: number;
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  variantName: string;
  size: number;
  unitPrice: number;
  linePrice: number;
  imagePosition: Product["imagePosition"];
};

export type CartOrder = {
  id: string;
  code: string;
  state: string;
  active: boolean;
  totalQuantity: number;
  subTotal: number;
  shipping: number;
  total: number;
  currencyCode: string;
  lines: CartLine[];
};

export type ShippingMethod = {
  id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  priceWithTax: number;
  metadata?: Record<string, unknown> | null;
};

export type CheckoutInput = {
  fullName: string;
  emailAddress: string;
  phoneNumber: string;
  province: string;
  city: string;
  streetLine1: string;
  postalCode: string;
  orderNote?: string;
  shippingMethodId: string;
};

export type CheckoutResult = {
  order: CartOrder;
  paymentMode: "dummy" | "provider-required";
};

export type CustomerAccount = {
  id: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber?: string | null;
};

export type CustomerAddress = {
  id: string;
  fullName?: string | null;
  streetLine1: string;
  streetLine2?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  phoneNumber?: string | null;
  defaultShippingAddress?: boolean | null;
  defaultBillingAddress?: boolean | null;
};

export type CustomerOrder = {
  id: string;
  code: string;
  state: string;
  orderPlacedAt?: string | null;
  total: number;
  totalQuantity: number;
  lines: Array<{
    id: string;
    quantity: number;
    productName: string;
    productSlug: string;
    variantName: string;
  }>;
};

export type CustomerDashboard = {
  customer: CustomerAccount;
  addresses: CustomerAddress[];
  orders: CustomerOrder[];
  totalOrders: number;
};

export type CustomerProfileInput = {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
};

export type CustomerAddressInput = {
  id?: string;
  fullName: string;
  phoneNumber: string;
  province: string;
  city: string;
  streetLine1: string;
  streetLine2?: string;
  postalCode: string;
  defaultShippingAddress: boolean;
};

export type LoginInput = {
  emailAddress: string;
  password: string;
};

export type RegisterInput = LoginInput & {
  firstName: string;
  lastName: string;
};

export type CommerceErrorPayload = {
  error: {
    code: string;
    message: string;
  };
};
