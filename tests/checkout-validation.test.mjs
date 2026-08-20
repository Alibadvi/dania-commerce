import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeIranianDigits,
  splitFullName,
  validateCheckoutInput,
  validateEntityId,
  validateLoginInput,
  validateQuantity,
  validateRegisterInput,
} from "../lib/checkout-validation.ts";

test("normalizes Persian and Arabic numerals", () => {
  assert.equal(normalizeIranianDigits("۰۹۱٢۳۴۵۶۷۸۹"), "09123456789");
});

test("validates and normalizes a guest checkout", () => {
  const input = validateCheckoutInput({
    fullName: "  علی   رضایی  ",
    emailAddress: "ALI@example.com",
    phoneNumber: "۰۹۱۲-۳۴۵-۶۷۸۹",
    province: "تهران",
    city: "تهران",
    streetLine1: "خیابان آزادی پلاک ۱",
    postalCode: "۱۲۳۴۵۶۷۸۹۰",
    shippingMethodId: "12",
  });
  assert.equal(input.fullName, "علی رضایی");
  assert.equal(input.emailAddress, "ali@example.com");
  assert.equal(input.phoneNumber, "09123456789");
  assert.equal(input.postalCode, "1234567890");
  assert.deepEqual(splitFullName(input.fullName), { firstName: "علی", lastName: "رضایی" });
});

test("rejects malformed identifiers and excessive quantities", () => {
  assert.throws(() => validateEntityId("1 } mutation { deleteProduct"));
  assert.throws(() => validateQuantity(21));
  assert.throws(() => validateQuantity(1.5));
});

test("rejects invalid checkout contact data", () => {
  assert.throws(() => validateCheckoutInput({
    fullName: "علی",
    emailAddress: "not-an-email",
    phoneNumber: "123",
    province: "تهران",
    city: "تهران",
    streetLine1: "آدرس",
    postalCode: "123",
    shippingMethodId: "1",
  }));
});

test("validates account credentials without weakening password bounds", () => {
  assert.deepEqual(validateLoginInput({ emailAddress: "USER@Example.com", password: "correct-horse" }), {
    emailAddress: "user@example.com",
    password: "correct-horse",
  });
  assert.deepEqual(validateRegisterInput({ firstName: "  سارا ", lastName: " احمدی ", emailAddress: "sara@example.com", password: "long-enough" }), {
    firstName: "سارا",
    lastName: "احمدی",
    emailAddress: "sara@example.com",
    password: "long-enough",
  });
  assert.throws(() => validateLoginInput({ emailAddress: "user@example.com", password: "short" }));
  assert.throws(() => validateRegisterInput({ firstName: "", lastName: "احمدی", emailAddress: "bad", password: "long-enough" }));
});
