import type { CheckoutInput, LoginInput, RegisterInput } from "./commerce-types";

export class ValidationError extends Error {
  readonly code = "INVALID_CHECKOUT";
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IRAN_MOBILE_PATTERN = /^09\d{9}$/;
const POSTAL_CODE_PATTERN = /^\d{10}$/;
const SAFE_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

function clean(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== "string") throw new ValidationError(`${field} نامعتبر است.`);
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized || normalized.length > maxLength) throw new ValidationError(`${field} نامعتبر است.`);
  return normalized;
}

function validateEmail(value: unknown): string {
  const emailAddress = clean(value, "ایمیل", 254).toLowerCase();
  if (!EMAIL_PATTERN.test(emailAddress)) throw new ValidationError("ایمیل معتبر وارد کنید.");
  return emailAddress;
}

function validatePassword(value: unknown): string {
  if (typeof value !== "string" || value.length < 8 || value.length > 72) {
    throw new ValidationError("رمز عبور باید بین ۸ تا ۷۲ کاراکتر باشد.");
  }
  return value;
}

export function normalizeIranianDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}

export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.split(" ").filter(Boolean);
  if (parts.length < 2) throw new ValidationError("نام و نام خانوادگی را کامل وارد کنید.");
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export function validateEntityId(value: unknown, field = "شناسه"): string {
  const id = clean(value, field, 128);
  if (!SAFE_ID_PATTERN.test(id)) throw new ValidationError(`${field} نامعتبر است.`);
  return id;
}

export function validateQuantity(value: unknown): number {
  if (!Number.isInteger(value) || Number(value) < 0 || Number(value) > 20) {
    throw new ValidationError("تعداد باید بین صفر تا ۲۰ باشد.");
  }
  return Number(value);
}

export function validateCheckoutInput(value: unknown): CheckoutInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ValidationError("اطلاعات سفارش نامعتبر است.");
  }
  const input = value as Record<string, unknown>;
  const fullName = clean(input.fullName, "نام", 100);
  splitFullName(fullName);
  const emailAddress = validateEmail(input.emailAddress);
  const phoneNumber = normalizeIranianDigits(clean(input.phoneNumber, "شماره موبایل", 20)).replace(/[\s-]/g, "");
  if (!IRAN_MOBILE_PATTERN.test(phoneNumber)) throw new ValidationError("شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد.");
  const postalCode = normalizeIranianDigits(clean(input.postalCode, "کد پستی", 20)).replace(/[\s-]/g, "");
  if (!POSTAL_CODE_PATTERN.test(postalCode)) throw new ValidationError("کد پستی باید ۱۰ رقم باشد.");
  const orderNote = typeof input.orderNote === "string" ? input.orderNote.trim().slice(0, 500) : undefined;

  return {
    fullName,
    emailAddress,
    phoneNumber,
    province: clean(input.province, "استان", 80),
    city: clean(input.city, "شهر", 80),
    streetLine1: clean(input.streetLine1, "آدرس", 300),
    postalCode,
    orderNote,
    shippingMethodId: validateEntityId(input.shippingMethodId, "روش ارسال"),
  };
}

export function validateLoginInput(value: unknown): LoginInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ValidationError("اطلاعات ورود نامعتبر است.");
  const input = value as Record<string, unknown>;
  return { emailAddress: validateEmail(input.emailAddress), password: validatePassword(input.password) };
}

export function validateRegisterInput(value: unknown): RegisterInput {
  const credentials = validateLoginInput(value);
  const input = value as Record<string, unknown>;
  return {
    ...credentials,
    firstName: clean(input.firstName, "نام", 60),
    lastName: clean(input.lastName, "نام خانوادگی", 80),
  };
}
