const FALLBACK_ORIGIN = "https://dania.ir";

export function siteOrigin(): string {
  const renderHostname = process.env.RENDER_EXTERNAL_HOSTNAME?.trim();
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
    || (renderHostname ? `https://${renderHostname}` : "");
  if (!configured) return FALLBACK_ORIGIN;
  try {
    const url = new URL(configured);
    if (url.protocol !== "http:" && url.protocol !== "https:") return FALLBACK_ORIGIN;
    return url.origin;
  } catch {
    return FALLBACK_ORIGIN;
  }
}

export function absoluteUrl(path = "/"): string {
  return new URL(path, `${siteOrigin()}/`).toString();
}
