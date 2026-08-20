import { LanguageCode, ShippingCalculator } from "@vendure/core";

export const danyaStandardShippingCalculator = new ShippingCalculator({
  code: "danya-standard-shipping-calculator",
  description: [
    { languageCode: LanguageCode.fa, value: "ارسال استاندارد با آستانه ارسال رایگان" },
    { languageCode: LanguageCode.en, value: "Danya standard shipping with free-shipping threshold" },
  ],
  args: {
    rate: { type: "int", defaultValue: 690_000, ui: { component: "currency-form-input" } },
    freeAbove: { type: "int", defaultValue: 20_000_000, ui: { component: "currency-form-input" } },
    taxRate: { type: "int", defaultValue: 0, ui: { component: "number-form-input", suffix: "%" } },
  },
  calculate: (ctx, order, args) => ({
    price: order.subTotalWithTax >= args.freeAbove ? 0 : args.rate,
    taxRate: args.taxRate,
    priceIncludesTax: ctx.channel.pricesIncludeTax,
    metadata: { estimatedDaysMin: 2, estimatedDaysMax: 4, freeAbove: args.freeAbove },
  }),
});
