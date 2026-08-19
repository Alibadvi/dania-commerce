import type { Metadata } from "next";
import { CheckoutPage } from "@/components/checkout-page";

export const metadata: Metadata = { title: "تکمیل سفارش" };
export default function Page() { return <CheckoutPage/>; }
