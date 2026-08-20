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
