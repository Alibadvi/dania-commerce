import "dotenv/config";

type GraphQLResponse<T> = { data?: T; errors?: Array<{ message: string }> };

const endpoint = process.env.ADMIN_API_URL ?? `http://localhost:${process.env.PORT ?? 3000}/admin-api`;
const identifier = process.env.SUPERADMIN_USERNAME ?? "superadmin";
const password = process.env.SUPERADMIN_PASSWORD ?? "superadmin";

async function request<T>(query: string, variables: Record<string, unknown> = {}, token?: string): Promise<{ payload: GraphQLResponse<T>; token?: string }> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ query, variables }),
  });
  const payload = await response.json() as GraphQLResponse<T>;
  if (!response.ok || payload.errors?.length) throw new Error(payload.errors?.map((item) => item.message).join(", ") || `HTTP ${response.status}`);
  return { payload, token: response.headers.get("vendure-auth-token") ?? token };
}

async function seed() {
  const login = await request<{ login: { id?: string; message?: string } }>(`mutation Login($identifier: String!, $password: String!) { login(username: $identifier, password: $password) { ... on CurrentUser { id } ... on ErrorResult { message } } }`, { identifier, password });
  if (!login.token) throw new Error("Admin login succeeded without a Vendure auth token");
  const channels = await request<{ channels: { items: Array<{ id: string; code: string }> } }>(`query Channels { channels { items { id code } } }`, {}, login.token);
  const defaultChannel = channels.payload.data?.channels.items[0];
  if (!defaultChannel) throw new Error("No Vendure channel was found");
  await request(`mutation ConfigureIranChannel($input: UpdateChannelInput!) {
    updateChannel(input: $input) {
      ... on Channel { id code defaultLanguageCode defaultCurrencyCode }
      ... on ErrorResult { errorCode message }
    }
  }`, {
    input: {
      id: defaultChannel.id,
      defaultLanguageCode: "fa",
      availableLanguageCodes: ["fa"],
      defaultCurrencyCode: "IRR",
      availableCurrencyCodes: ["IRR"],
      pricesIncludeTax: true,
    },
  }, login.token);
  console.log("Vendure is reachable; the default channel now uses Persian and IRR.");
  console.log("Open /dashboard and import the Persian catalog or add your real inventory. Demo products remain available in the storefront until the API is connected.");
}

seed().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
