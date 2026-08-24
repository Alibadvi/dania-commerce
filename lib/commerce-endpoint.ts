export function vendureShopApiUrl(): string | undefined {
  const configured = process.env.VENDURE_SHOP_API_URL?.trim();
  if (!configured) return undefined;

  const candidate = configured.includes("://")
    ? configured
    : `http://${configured}`;

  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
    if (url.pathname === "/") url.pathname = "/shop-api";
    return url.toString();
  } catch {
    return undefined;
  }
}
