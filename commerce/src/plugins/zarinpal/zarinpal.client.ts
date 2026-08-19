type ZarinpalEnvelope<T> = { data: T; errors: Array<{ code?: number; message?: string }> | Record<string, unknown> };
type RequestData = { code: number; message: string; authority: string; fee_type: string; fee: number };
type VerifyData = { code: number; message: string; ref_id: number; card_pan?: string; card_hash?: string; fee_type?: string; fee?: number };

export class ZarinpalError extends Error {
  constructor(message: string, public readonly code?: number) { super(message); }
}

export class ZarinpalClient {
  private readonly baseUrl: string;
  private readonly gatewayUrl: string;

  constructor(private readonly merchantId: string, sandbox = false) {
    this.baseUrl = sandbox ? "https://sandbox.zarinpal.com/pg/v4/payment" : "https://payment.zarinpal.com/pg/v4/payment";
    this.gatewayUrl = sandbox ? "https://sandbox.zarinpal.com/pg/StartPay" : "https://payment.zarinpal.com/pg/StartPay";
  }

  async request(input: { amount: number; callbackUrl: string; description: string; orderCode: string; mobile?: string; email?: string }) {
    const payload = await this.post<RequestData>("request.json", {
      merchant_id: this.merchantId,
      amount: input.amount,
      currency: "IRR",
      callback_url: input.callbackUrl,
      description: input.description,
      metadata: { order_id: input.orderCode, mobile: input.mobile, email: input.email },
    });
    if (payload.code !== 100 || !payload.authority) throw new ZarinpalError(payload.message || "Zarinpal request failed", payload.code);
    return { authority: payload.authority, paymentUrl: `${this.gatewayUrl}/${payload.authority}` };
  }

  async verify(input: { amount: number; authority: string }) {
    const payload = await this.post<VerifyData>("verify.json", {
      merchant_id: this.merchantId,
      amount: input.amount,
      authority: input.authority,
    });
    if (payload.code !== 100 && payload.code !== 101) throw new ZarinpalError(payload.message || "Zarinpal verification failed", payload.code);
    return payload;
  }

  private async post<T>(path: string, body: Record<string, unknown>): Promise<T> {
    const response = await fetch(`${this.baseUrl}/${path}`, {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(12_000),
    });
    if (!response.ok) throw new ZarinpalError(`Zarinpal HTTP ${response.status}`);
    const envelope = (await response.json()) as ZarinpalEnvelope<T>;
    if (!envelope.data || (Array.isArray(envelope.errors) && envelope.errors.length)) {
      const first = Array.isArray(envelope.errors) ? envelope.errors[0] : undefined;
      throw new ZarinpalError(first?.message ?? "Invalid Zarinpal response", first?.code);
    }
    return envelope.data;
  }
}
