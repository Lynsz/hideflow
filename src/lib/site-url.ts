type SiteUrlEnvironment = {
  SITE_URL?: string;
  VERCEL_PROJECT_PRODUCTION_URL?: string;
};

export function resolveSiteUrl(environment: SiteUrlEnvironment) {
  const configuredUrl = environment.SITE_URL?.trim();
  const vercelProductionUrl = environment.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  const candidate = configuredUrl
    ? configuredUrl
    : vercelProductionUrl
      ? `https://${vercelProductionUrl}`
      : "http://localhost:3000";

  const url = new URL(candidate);
  const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  const usesAllowedProtocol =
    url.protocol === "https:" || (url.protocol === "http:" && isLocal);
  if (!usesAllowedProtocol) {
    throw new Error("SITE_URL deve usar HTTPS fora do ambiente local.");
  }

  return url;
}
