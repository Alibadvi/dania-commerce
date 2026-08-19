const SHOP_API_URL = process.env.VENDURE_SHOP_API_URL ?? "http://localhost:3000/shop-api";

type GraphQLResponse<T> = { data?: T; errors?: Array<{ message: string }> };

export async function vendureQuery<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const response = await fetch(SHOP_API_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Vendure request failed: ${response.status}`);
  const payload = (await response.json()) as GraphQLResponse<T>;
  if (payload.errors?.length || !payload.data) throw new Error(payload.errors?.[0]?.message ?? "Vendure returned no data");
  return payload.data;
}
