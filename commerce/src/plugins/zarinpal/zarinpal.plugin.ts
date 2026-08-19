import { Injectable } from "@nestjs/common";
import { Mutation, Resolver } from "@nestjs/graphql";
import gql from "graphql-tag";
import {
  ActiveOrderService,
  Ctx,
  LanguageCode,
  Logger,
  PaymentMethodHandler,
  PluginCommonModule,
  RequestContext,
  VendurePlugin,
} from "@vendure/core";
import { ZarinpalClient } from "./zarinpal.client";

function client() {
  const merchantId = process.env.ZARINPAL_MERCHANT_ID;
  if (!merchantId) throw new Error("ZARINPAL_MERCHANT_ID is not configured");
  return new ZarinpalClient(merchantId, process.env.ZARINPAL_SANDBOX === "true");
}

export const zarinpalPaymentHandler = new PaymentMethodHandler({
  code: "zarinpal",
  description: [
    { languageCode: LanguageCode.fa, value: "پرداخت امن زرین‌پال" },
    { languageCode: LanguageCode.en, value: "Zarinpal secure payment" },
  ],
  args: {},
  createPayment: async (_ctx, order, amount, _args, metadata) => {
    const authority = typeof metadata?.authority === "string" ? metadata.authority : "";
    const status = typeof metadata?.status === "string" ? metadata.status : "";
    if (!authority || status !== "OK") {
      return { amount, state: "Declined" as const, metadata: { errorMessage: "Payment was cancelled or authority is missing" } };
    }
    try {
      const result = await client().verify({ amount, authority });
      return {
        amount,
        state: "Settled" as const,
        transactionId: String(result.ref_id),
        metadata: {
          authority,
          cardHash: result.card_hash,
          public: { referenceId: String(result.ref_id), cardPan: result.card_pan },
        },
      };
    } catch (error) {
      Logger.error(error instanceof Error ? error.message : String(error), "ZarinpalPayment");
      return { amount: order.totalWithTax, state: "Declined" as const, metadata: { errorMessage: "Zarinpal verification failed", authority } };
    }
  },
  settlePayment: async () => ({ success: true }),
});

@Injectable()
class ZarinpalService {
  constructor(private readonly activeOrderService: ActiveOrderService) {}
  async start(ctx: RequestContext) {
    const order = await this.activeOrderService.getOrderFromContext(ctx);
    if (!order) throw new Error("سبد خرید فعالی پیدا نشد");
    if (order.state !== "ArrangingPayment") throw new Error("سفارش هنوز آماده پرداخت نیست");
    const storefront = (process.env.STOREFRONT_URL ?? "http://localhost:4173").split(",")[0].replace(/\/$/, "");
    const result = await client().request({
      amount: order.totalWithTax,
      callbackUrl: `${storefront}/payment/zarinpal/callback`,
      description: `سفارش دانیا ${order.code}`,
      orderCode: order.code,
    });
    return { ...result, orderCode: order.code };
  }
}

@Resolver()
class ZarinpalResolver {
  constructor(private readonly service: ZarinpalService) {}
  @Mutation()
  startZarinpalPayment(@Ctx() ctx: RequestContext) { return this.service.start(ctx); }
}

const shopApiExtensions = gql`
  type ZarinpalPaymentSession { authority: String!, paymentUrl: String!, orderCode: String! }
  extend type Mutation { startZarinpalPayment: ZarinpalPaymentSession! }
`;

@VendurePlugin({
  imports: [PluginCommonModule],
  providers: [ZarinpalService],
  shopApiExtensions: { schema: shopApiExtensions, resolvers: [ZarinpalResolver] },
  compatibility: "^3.7.0",
})
export class ZarinpalPlugin {}
