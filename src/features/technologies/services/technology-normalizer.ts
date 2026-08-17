const WHITESPACE_PATTERN = /\s+/gu;

export function normalizeTechnologyName(value: string) {
  const name = value.trim().replace(WHITESPACE_PATTERN, " ");
  return { name, normalizedName: name.toLowerCase() };
}
