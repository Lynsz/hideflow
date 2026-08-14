const DEFAULT_AUTH_REDIRECT = "/dashboard";
const INTERNAL_ORIGIN = "https://hireflow.invalid";

function isSafeInternalPath(value: string) {
  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return false;
  }

  try {
    const decodedValue = decodeURIComponent(value);

    if (decodedValue.startsWith("//") || decodedValue.includes("\\")) {
      return false;
    }

    return new URL(value, INTERNAL_ORIGIN).origin === INTERNAL_ORIGIN;
  } catch {
    return false;
  }
}

export function getSafeRedirectPath(
  value: string | null | undefined,
  fallback = DEFAULT_AUTH_REDIRECT,
) {
  if (!value || !isSafeInternalPath(value)) {
    return fallback;
  }

  return value;
}
