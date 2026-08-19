import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowLeftIcon, ShieldIcon } from "@/components/icons";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "نتیجه پرداخت" };

type PaymentResult = { __typename: string; code?: string; state?: string; errorCode?: string; message?: string; paymentErrorMessage?: string };

async function verify(authority: string, status: string): Promise<PaymentResult> {
  const cookieStore = await cookies();
  const response = await fetch(process.env.VENDURE_SHOP_API_URL ?? "http://localhost:3000/shop-api", {
    method: "POST",
    headers: { "content-type": "application/json", cookie: cookieStore.toString() },
    body: JSON.stringify({
      query: `mutation VerifyZarinpal($metadata: JSON!) { addPaymentToOrder(input: { method: "zarinpal", metadata: $metadata }) { __typename ... on Order { code state } ... on ErrorResult { errorCode message } ... on PaymentDeclinedError { paymentErrorMessage } ... on PaymentFailedError { paymentErrorMessage } } }`,
      variables: { metadata: { authority, status } },
    }),
    cache: "no-store",
  });
  if (!response.ok) return { __typename: "NetworkError", message: "ارتباط با سرور پرداخت برقرار نشد." };
  const payload = await response.json() as { data?: { addPaymentToOrder: PaymentResult }; errors?: Array<{ message: string }> };
  return payload.data?.addPaymentToOrder ?? { __typename: "PaymentError", message: payload.errors?.[0]?.message ?? "نتیجه پرداخت نامشخص است." };
}

export default async function ZarinpalCallbackPage({ searchParams }: { searchParams: Promise<{ Authority?: string; Status?: string }> }) {
  const { Authority = "", Status = "NOK" } = await searchParams;
  const result = Authority && Status === "OK" ? await verify(Authority, Status) : { __typename: "Cancelled", message: "پرداخت لغو شد یا ناموفق بود." };
  const succeeded = result.__typename === "Order" && result.state === "PaymentSettled";
  return <main className="payment-result"><div className={succeeded ? "success" : "failed"}><span><ShieldIcon /></span><p className="eyebrow"><i /> نتیجه پرداخت</p><h1>{succeeded ? "پرداخت با موفقیت انجام شد" : "پرداخت کامل نشد"}</h1><p>{succeeded ? `سفارش ${result.code} ثبت شد و در حال آماده‌سازی است.` : (result.paymentErrorMessage ?? result.message ?? "لطفاً دوباره تلاش کنید.")}</p><div>{succeeded ? <Link className="button button-primary" href="/account">مشاهده سفارش <ArrowLeftIcon /></Link> : <Link className="button button-primary" href="/checkout">تلاش دوباره <ArrowLeftIcon /></Link>}<Link className="text-link" href="/">صفحه اصلی</Link></div></div></main>;
}
